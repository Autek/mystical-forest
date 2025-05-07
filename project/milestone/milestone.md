---
title: Milestone Report CS-341 2025
---

# Project Title


## Progress Summary

1. Summarize what you have accomplished so far.

	Enter your features from the proposal in the table below. For each feature, indicate whether you completed the implementation, it is work in progress, or you have to start it.

	| Feature                                       | Points | Adapted Points |
	|-----------------------------------------------|--------|----------------|
	| Ambient Occlusion                             | 20     | 17             |
	| Particle Effects                              | 20     | 17             |
	| Fog                                           | 5      | 4              |
	| L-Systems for Procedural Scene Generation     | 10     | 8              |
	| Bloom                                         | 5      | 4              |

	<!-- work in progress: fff3cd, completed: d4edda, upcoming (= not started): cce5ff -->

	<table>
		<thead>
			<tr>
				<th>Feature</th>
				<th>Adapted Points</th>
				<th>Status</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>Ambient Occlusion</td>
				<td>17</td>
				<td style="background-color: #fff3cd;">Work in progress</td>
			</tr>
			<tr>
				<td>Particle Effects</td>
				<td>17</td>
				<td style="background-color: #fff3cd;">Work in progress</td>
			</tr>
			<tr>
				<td>Fog</td>
				<td>4</td>
				<td style="background-color: #d4edda;">TODO: state - also change color</td>
			</tr>
			<tr>
				<tr>
					<td>L-Systems for Procedural Scene Generation</td>
					<td>10</td>
					<td style="background-color: #cce5ff;">TODO: state - also change color</td>
				</tr>
			</tr>
			<tr>
				<td>Bloom</td>
				<td>5</td>
				<td style="background-color: #fff3cd;">TODO: state - also change color</td>
			</tr>
		</tbody>
	</table>

	Add a brief summary of the goals achieved each week. A few words per cell are sufficient.

	<table>
		<caption>Achieved Goals</caption>
		<tr>
			<th></th>
			<th>Charlie</th>
			<th>Marius</th>
			<th>Alonso</th>
		</tr>
		<tr>
			<td>Week 1 (Proposal)</td>
			<td>drafting and thinking about proposal</td>
			<td></td>
			<td>Doing research and finding papers on featurs</td>
		</tr>
		<tr style="background-color: #f0f0f0;">
			<td>Week 2 (Easter)</td>
			<td>vacay</td>
			<td>vacay</td>
			<td>Reread my features</td>
		</tr>
		<tr>
			<td>Week 3</td>
			<td>started on tutorial, struggle with framework</td>
			<td></td>
			<td>Start tutorial</td>
		</tr>
		<tr>
			<td>Week 4</td>
			<td>started on SSAO, lots more struggle with framework</td>
			<td></td>
			<td>Finish tutorial and work on fog</td>
		</tr>
	</table>


2. Show some preliminary results.

	![An image showing your progress.](images/demo.jpg){width="300px"}

	![A video showing your progress.](videos/demo.mp4){width="500px"}

	Briefly describe the results you obtained until now and the overall state of the project.

	For SSAO, we do not have a working implementation yet. We have shaders for both the G-Buffer and the SSAO pass, as well as tentative shader renderers for both, but we are struggling to get the G-Buffer to work properly. We couldn't render anything of SSAO for the milestone.

	TODO Alonso add FOG image
	For the fog, we have simple linear fog shader implementation, the more complex inverse exponential fog ended running into issues. With more experience with the framework, this should be done quickly. The linear fog shader simply determines a fog factor for which it should mix in a fog like color. The problem with this simple shader is that it goes opaque quickly and abruptly which isnt realistic. The exponential fog and the squared exponential fog tends smoother.
	TODO marius 


3. Optionally present the validation of any feature you have already implemented. This is not mandatory, but can help you get useful feedback for the final report: feature validation will be the main component determining your grade. 

	Follow the following template for each feature you want to validate.

	- Feature Name

		- Implementation

			Briefly describe how you implemented the feature.

		- Validation

			Provide evidence (plots, screenshots, animations, etc.) that the feature works as expected.


4. Report the number of hours each team member worked on the project.

	<table>
		<caption>Worked Hours</caption>
		<tr>
			<th></th>
			<th>Charlie</th>
			<th>Marius</th>
			<th>Alonso</th>
		</tr>
		<tr>
			<td>Week 1 (Proposal)</td>
			<td>2h</td>
			<td></td>
			<td>0h</td>
		</tr>
		<tr style="background-color: #f0f0f0;">
			<td>Week 2 (Easter)</td>
			<td>0h</td>
			<td></td>
			<td>2h</td>
		</tr>
		<tr>
			<td>Week 3</td>
			<td>8h</td>
			<td></td>
			<td>4h</td>
		</tr>
		<tr>
			<td>Week 4</td>
			<td>12h</td>
			<td></td>
			<td>14h</td>
		</tr>
	</table>

5. Is the project progressing as expected? Was your workload estimate correct? Critically reflect on your work plan and assess if you are on track.

	i think we should think about this as a group to have a cohesive paragraph, then personal paragraphs for each of us
	
	TODO general paragraph
	
	Charlie: I could not get as much done as I'd hoped, mostly because I am struggling with the framework and because of time consuming projects in other classes. I believe I will be able to finish the SSAO implementation in time though, as am not far off-track at all. 

	Alonso: +1
	TODO

## Schedule Update

1. Acknowledge any delays or unexpected issues, and motivate proposed changes to the schedule, if needed.

	The biggest delay is the unexpected time needed to get even a basic understanding of the framework. add whatever you want here.

	TODO

2. Present the work plan for the remaining weeks.

	<table>
		<caption>Updated Schedule</caption>
		<tr>
			<th></th>
			<th>Charlie</th>
			<th>Marius</th>
			<th>Alonso</th>
		</tr>
		<tr>
			<td>Week 5</td>
			<td>SSAO</td>
			<td></td>
			<td>Finish Fog + L-Systems</td>
		</tr>
		<tr>
			<td>Week 6</td>
			<td>SSAO</td>
			<td></td>
			<td>L-Systems</td>
		</tr>
		<tr>
			<td>Week 7</td>
			<td>SSAO</td>
			<td></td>
			<td>Bloom</td>
		</tr>
	</table>