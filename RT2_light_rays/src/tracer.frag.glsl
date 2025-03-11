precision highp float;

#define MAX_RANGE 1e6
//#define NUM_REFLECTIONS

//#define NUM_SPHERES
#if NUM_SPHERES != 0
uniform vec4 spheres_center_radius[NUM_SPHERES]; // ...[i] = [center_x, center_y, center_z, radius]
#endif

//#define NUM_PLANES
#if NUM_PLANES != 0
uniform vec4 planes_normal_offset[NUM_PLANES]; // ...[i] = [nx, ny, nz, d] such that dot(vec3(nx, ny, nz), point_on_plane) = d
#endif

//#define NUM_CYLINDERS
struct Cylinder {
	vec3 center;
	vec3 axis;
	float radius;
	float height;
};
#if NUM_CYLINDERS != 0
uniform Cylinder cylinders[NUM_CYLINDERS];
#endif

#define SHADING_MODE_NORMALS 1
#define SHADING_MODE_BLINN_PHONG 2
#define SHADING_MODE_PHONG 3
//#define SHADING_MODE

// materials
//#define NUM_MATERIALS
struct Material {
	vec3 color;
	float ambient;
	float diffuse;
	float specular;
	float shininess;
	float mirror;
};
uniform Material materials[NUM_MATERIALS];
#if (NUM_SPHERES != 0) || (NUM_PLANES != 0) || (NUM_CYLINDERS != 0)
uniform int object_material_id[NUM_SPHERES+NUM_PLANES+NUM_CYLINDERS];
#endif

/*
	Get the material corresponding to mat_id from the list of materials.
*/
Material get_material(int mat_id) {
	Material m = materials[0];
	for(int mi = 1; mi < NUM_MATERIALS; mi++) {
		if(mi == mat_id) {
			m = materials[mi];
		}
	}
	return m;
}

// lights
//#define NUM_LIGHTS
struct Light {
	vec3 color;
	vec3 position;
};
#if NUM_LIGHTS != 0
uniform Light lights[NUM_LIGHTS];
#endif
uniform vec3 light_color_ambient;


varying vec3 v2f_ray_origin;
varying vec3 v2f_ray_direction;

/*
	Solve the quadratic a*x^2 + b*x + c = 0. The method returns the number of solutions and store them
	in the argument solutions.
*/
int solve_quadratic(float a, float b, float c, out vec2 solutions) {

	// Linear case: bx+c = 0
	if (abs(a) < 1e-12) {
		if (abs(b) < 1e-12) {
			// no solutions
			return 0; 
		} else {
			// 1 solution: -c/b
			solutions[0] = - c / b;
			return 1;
		}
	} else {
		float delta = b * b - 4. * a * c;

		if (delta < 0.) {
			// no solutions in real numbers, sqrt(delta) produces an imaginary value
			return 0;
		} 

		// Avoid cancellation:
		// One solution doesn't suffer cancellation:
		//      a * x1 = 1 / 2 [-b - bSign * sqrt(b^2 - 4ac)]
		// "x2" can be found from the fact:
		//      a * x1 * x2 = c

		// We do not use the sign function, because it returns 0
		// float a_x1 = -0.5 * (b + sqrt(delta) * sign(b));
		float sqd = sqrt(delta);
		if (b < 0.) {
			sqd = -sqd;
		}
		float a_x1 = -0.5 * (b + sqd);


		solutions[0] = a_x1 / a;
		solutions[1] = c / a_x1;

		// 2 solutions
		return 2;
	} 
}

/*
	Check for intersection of the ray with a given sphere in the scene.
*/
bool ray_sphere_intersection(
		vec3 ray_origin, vec3 ray_direction, 
		vec3 sphere_center, float sphere_radius, 
		out float t, out vec3 normal) 
{
	vec3 oc = ray_origin - sphere_center;

	vec2 solutions; // solutions will be stored here

	int num_solutions = solve_quadratic(
		// A: t^2 * ||d||^2 = dot(ray_direction, ray_direction) but ray_direction is normalized
		1., 
		// B: t * (2d dot (o - c))
		2. * dot(ray_direction, oc),	
		// C: ||o-c||^2 - r^2				
		dot(oc, oc) - sphere_radius*sphere_radius,
		// where to store solutions
		solutions
	);

	// result = distance to collision
	// MAX_RANGE means there is no collision found
	t = MAX_RANGE+10.;
	bool collision_happened = false;

	if (num_solutions >= 1 && solutions[0] > 0.) {
		t = solutions[0];
	}
	
	if (num_solutions >= 2 && solutions[1] > 0. && solutions[1] < t) {
		t = solutions[1];
	}

	if (t < MAX_RANGE) {
		vec3 intersection_point = ray_origin + ray_direction * t;
		normal = (intersection_point - sphere_center) / sphere_radius;

		return true;
	} else {
		return false;
	}	
}

/*
	Check for intersection of the ray with a given plane in the scene.
*/
bool ray_plane_intersection(
		vec3 ray_origin, vec3 ray_direction, 
		vec3 plane_normal, float plane_offset, 
		out float t, out vec3 normal) 
{
	/** #TODO RT1.1:
	The plane is described by its normal vec3(nx, ny, nz) and an offset b.
	Point x belongs to the plane iff `dot(normal, x) = b`.

	- Compute the intersection between the ray and the plane
		- If the ray and the plane are parallel there is no intersection
		- Otherwise, compute intersection data and store it in `normal`, and `t` (distance along ray until intersection).
	- Return whether there is an intersection in front of the viewer (t > 0)
	*/

	// can use the plane center if you need it
	vec3 plane_center = plane_normal * plane_offset;

	float temp = dot(plane_normal, ray_direction);
	// if (temp < 1e-6) {
	// 	return false; // parallel
	// }

	t = dot(plane_normal, plane_center - ray_origin) / temp;
 	vec3 x = ray_origin + t * ray_direction;
	// if ( dot(plane_normal, x) - plane_offset < 1e-6) {
	// 	return false; // x not in the plane
	// }

	normal = plane_normal;
	if (dot(ray_direction, plane_normal) > 0.) {
		normal = -normal;
	}
	return t > 0.; // in front of the viewer
}

/*
	Check for intersection of the ray with a given cylinder in the scene.
*/
bool ray_cylinder_intersection(
		vec3 ray_origin, vec3 ray_direction, 
		Cylinder cyl,
		out float t, out vec3 normal) 
{
		/** #TODO RT1.2.2: 
	- Compute the first valid intersection between the ray and the cylinder
		(valid means in front of the viewer: t > 0)
	- Store the intersection point in `intersection_point`
	- Store the ray parameter in `t`
	- Store the normal at intersection_point in `normal`
	- Return whether there is an intersection with t > 0
	*/

	vec3 u = cross(ray_origin - cyl.center, cyl.axis);
	vec3 v = cross(ray_direction, cyl.axis);

	vec2 sol;
	int nb_sols = solve_quadratic(
		dot(v, v), 2. * dot(u, v), dot(u, u) - cyl.radius * cyl.radius, sol);

	// If no solutions, no hit, return immeadiately
	if (nb_sols == 0) {
		return false;
	}

	// One solution check if intersection is behind
	if (nb_sols == 1) {
		t = sol[0];
		if (t < 0.) {
			return false;	
		}
	}

	// Check passing through top
	bool in_hit = false;
	if (nb_sols == 2) {
		// Both intersections are behind so exit out
		if (sol[0] < 0. && sol[1] < 0.) {
			return false;
		}

		// Order sol within t at least 1 t is positifs
		if (sol[0] > sol[1]) {
			float temp = sol[0];
			sol[0] = sol[1];
			sol[1] = temp;
		}

		bool hit = false;
		for (int i = 0; i < 2; i++){
			// check if t is negative
			if (sol[i] < 0.) {
				continue;
			}

			// check if height hit valid
			vec3 x_i = ray_origin + ray_direction * sol[i];
			vec3 xc_i = x_i - cyl.center;

			float h_i = 2. * (abs(dot(cyl.axis, xc_i)) / length(cyl.axis));

			// break if hit
			if (h_i <= cyl.height) {
				hit = true;			// hit cylinder
				in_hit = (i != 0);
				t = sol[i];
				break;
			}
		}

		if (!hit) {
			return false;
		}
	}

	vec3 intersection_point = ray_origin + ray_direction * t;
	vec3 tmp = intersection_point - cyl.center;

	float rem = dot(cyl.axis, tmp) / dot(cyl.axis, cyl.axis);
	
	normal = (in_hit)? - tmp + rem * cyl.axis: tmp - rem * cyl.axis;
	normal = normalize(normal);

	return true;
}


/*
	Check for intersection of the ray with any object in the scene.
*/
bool ray_intersection(
		vec3 ray_origin, vec3 ray_direction, 
		out float col_distance, out vec3 col_normal, out int material_id) 
{
	col_distance = MAX_RANGE + 10.;
	col_normal = vec3(0., 0., 0.);

	float object_distance;
	vec3 object_normal;

	// Check for intersection with each sphere
	#if NUM_SPHERES != 0 // only run if there are spheres in the scene
	for(int i = 0; i < NUM_SPHERES; i++) {
		bool b_col = ray_sphere_intersection(
			ray_origin, 
			ray_direction, 
			spheres_center_radius[i].xyz, 
			spheres_center_radius[i][3], 
			object_distance, 
			object_normal
		);

		// choose this collision if its closer than the previous one
		if (b_col && object_distance < col_distance) {
			col_distance = object_distance;
			col_normal = object_normal;
			material_id =  object_material_id[i];
		}
	}
	#endif

	// Check for intersection with each plane
	#if NUM_PLANES != 0 // only run if there are planes in the scene
	for(int i = 0; i < NUM_PLANES; i++) {
		bool b_col = ray_plane_intersection(
			ray_origin, 
			ray_direction, 
			planes_normal_offset[i].xyz, 
			planes_normal_offset[i][3], 
			object_distance, 
			object_normal
		);

		// choose this collision if its closer than the previous one
		if (b_col && object_distance < col_distance) {
			col_distance = object_distance;
			col_normal = object_normal;
			material_id =  object_material_id[NUM_SPHERES+i];
		}
	}
	#endif

	// Check for intersection with each cylinder
	#if NUM_CYLINDERS != 0 // only run if there are cylinders in the scene
	for(int i = 0; i < NUM_CYLINDERS; i++) {
		bool b_col = ray_cylinder_intersection(
			ray_origin, 
			ray_direction,
			cylinders[i], 
			object_distance, 
			object_normal
		);

		// choose this collision if its closer than the previous one
		if (b_col && object_distance < col_distance) {
			col_distance = object_distance;
			col_normal = object_normal;
			material_id =  object_material_id[NUM_SPHERES+NUM_PLANES+i];
		}
	}
	#endif

	return col_distance < MAX_RANGE;
}

/*
	Return the color at an intersection point given a light and a material, exluding the contribution
	of potential reflected rays.
*/
vec3 lighting(
		vec3 object_point, vec3 object_normal, vec3 direction_to_camera, 
		Light light, Material mat) {

	/** #TODO RT2.2: 
	- shoot a shadow ray from the intersection point to the light
	- check whether it intersects an object from the scene
	- update the lighting accordingly
	*/
	// vect from intersection point to light
	// TODO: change name once slides become readable again
	vec3 to_light_dir = light.position - object_point;
	float to_light_dist = length(to_light_dir);
	to_light_dir = normalize(to_light_dir);

	float col_distance = -1.;
	vec3 col_normal = vec3(-1.);
	int material_id = -1;

	bool is_shadowed = ray_intersection(
		object_point + to_light_dir * 0.001, 
		to_light_dir, 
		col_distance, 
		col_normal, 
		material_id
	);
	// if intersection and is not behind light
	if (is_shadowed && col_distance < to_light_dist) {
		return vec3(0.);
	}

	/** #TODO RT2.1: 
	- compute the diffuse component
	- make sure that the light is located in the correct side of the object
	- compute the specular component 
	- make sure that the reflected light shines towards the camera
	- return the ouput color

	You can use existing methods for `vec3` objects such as `reflect`, `dot`, `normalize` and `length`.
	*/
	vec3 diffuse = vec3(0.);
	vec3 specular = vec3(0.);

	vec3 l = normalize(light.position - object_point);
	float cos = dot(object_normal, l);

	if (cos < 0.) {
		return vec3(0.);
	}

	vec3 md = mat.diffuse * mat.color;
	diffuse = md * cos;

	#if SHADING_MODE == SHADING_MODE_PHONG
		vec3 r = 2. * object_normal * dot(object_normal, l) - l;
		cos = dot(r, direction_to_camera);
	#endif
	#if SHADING_MODE == SHADING_MODE_BLINN_PHONG
		vec3 h = normalize(direction_to_camera + l);
		cos = dot(h, object_normal);
	#endif
	if (cos >= 0.) {
		vec3 ms = mat.specular * mat.color;
		specular = ms * pow(cos, mat.shininess);
	}

	mat.color = light.color * (diffuse + specular);

	return mat.color;
}

/*
Render the light in the scene using ray-tracing!
*/
vec3 render_light(vec3 ray_origin, vec3 ray_direction) {

	/** #TODO RT2.1: 
	- check whether the ray intersects an object in the scene
	- if it does, compute the ambient contribution to the total intensity
	- compute the intensity contribution from each light in the scene and store the sum in pix_color
	*/

	/** #TODO RT2.3.2: 
	- create an outer loop on the number of reflections (see below for a suggested structure)
	- compute lighting with the current ray (might be reflected)
	- use the above formula for blending the current pixel color with the reflected one
	- update ray origin and direction

	We suggest you structure your code in the following way:

	vec3 pix_color          = vec3(0.);
	float reflection_weight = ...;

	for(int i_reflection = 0; i_reflection < NUM_REFLECTIONS+1; i_reflection++) {
		float col_distance;
		vec3 col_normal = vec3(0.);
		int mat_id      = 0;

		if(ray_intersection(ray_origin, ray_direction, col_distance, col_normal, mat_id)) {
			Material m = get_material(mat_id); // get material of the intersected object

			...

			ray_origin        = ...;
			ray_direction     = ...;
			reflection_weight = ...;
		}
	}
	*/

	
	
	// vec3 pix_color = vec3(0.);
	// float col_distance;
	// vec3 col_normal = vec3(0.);
	// int mat_id = 0;
	// if(ray_intersection(ray_origin, ray_direction, col_distance, col_normal, mat_id)) {
	// 	Material m = get_material(mat_id);
	// 	vec3 ma = m.color * m.ambient;
	// 	vec3 I = ma * light_color_ambient;
	// 	pix_color = I;

	// 	#if NUM_LIGHTS != 0
	// 	for(int i_light = 0; i_light < NUM_LIGHTS; i_light++) {
	// 		vec3 col_pos = col_distance * ray_direction + ray_origin;
	// 		vec3 direction_to_camera = -ray_direction;
	// 		pix_color += lighting(col_pos, col_normal, direction_to_camera, lights[i_light], m);
	// 	}
	// 	#endif
	// }
	
	vec3 pix_color = vec3(0.);

	// Ray vars
	vec3 origin = ray_origin;
	vec3 direction = normalize(ray_direction);

	// Intersection vars
	float col_distance;
	vec3 col_normal = vec3(0.);
	int mat_id = 0;

	// Reflection vars
	float mul_alpha = 1.;
	
	for (int r = 0; r < NUM_REFLECTIONS+1; r++) {
		if(!ray_intersection(origin, direction, col_distance, col_normal, mat_id)){
			break;
		}

		// Color calc
		Material m = get_material(mat_id);
		vec3 m_ambient = m.color * m.ambient;
		vec3 local_light = m_ambient * light_color_ambient;

		#if NUM_LIGHTS != 0
		for (int i_light = 0; i_light < NUM_LIGHTS; i_light++) {
			vec3 col_pos = col_distance * direction + origin;
			vec3 direction_to_origin = - direction;
			local_light += lighting(col_pos, col_normal, -direction, lights[i_light], m);
		}
		#endif

		// Reflection Calculations + Accumulations
		pix_color += (1. - m.mirror) * mul_alpha * local_light;
		mul_alpha = mul_alpha * m.mirror;

		// Next-Ray
		origin = origin + direction * col_distance;
		direction = normalize(direction - 2. * (dot(normalize(col_normal), direction) * normalize(col_normal)));
	}
	

	

	return pix_color;
}


/*
	Draws the normal vectors of the scene in false color.
*/
vec3 render_normals(vec3 ray_origin, vec3 ray_direction) {
	float col_distance;
	vec3 col_normal = vec3(0.);
	int mat_id = 0;

	if( ray_intersection(ray_origin, ray_direction, col_distance, col_normal, mat_id) ) {	
		return 0.5*(col_normal + 1.0);
	} else {
		vec3 background_color = vec3(0., 0., 1.);
		return background_color;
	}
}


void main() {
	vec3 ray_origin = v2f_ray_origin;
	vec3 ray_direction = normalize(v2f_ray_direction);

	vec3 pix_color = vec3(0.);

	#if SHADING_MODE == SHADING_MODE_NORMALS
	pix_color = render_normals(ray_origin, ray_direction);
	#else
	pix_color = render_light(ray_origin, ray_direction);
	#endif

	gl_FragColor = vec4(pix_color, 1.);
}
