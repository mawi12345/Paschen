Controller:
- loads the content of the view
- adds an parent element to it
- triggers an document event
- waits till all images are loaded
- destroys the last view -> this will show the new view

The parent element looks like:
	<div id="<<NameOfView>>" class="<<ResolutionName>>"></div>
	
	NameOfView: 	file name without .html
	ResolutionName:	name of the biggest suitable resolution (big, small)
	
The document events name is <<NameOfView>>Load
	Example: $(document).bind('menuLoad', function(){ ... });