<!-- <?php
function grabJS($root, $nextDir)
{
	echo $nextDir." -> ".$root."<br /><br />";
	chdir($nextDir);
	$files = scandir(getcwd());
	echo "cur = ".getcwd()."<br />";
	foreach($files as &$cur)
	{
		if($cur=="."||$cur=="..")continue;
		echo $cur."<br />";
		if(substr($cur, -3)==".js")
		{
			echo "<script>";
			require $cur;
			echo "</script>";
		}
		else if(compare($cur, ".")==-1)
		{
			grabJS(getcwd(), $cur);
		}
	}
	chdir($root);
}
//grabJS(getcwd(), "includes/js");
?> -->

<!-- Open Source Libraries -->
<script src="includes/js/depend/scroll/Animate.js"></script>
<script src="includes/js/depend/scroll/Scroller.js"></script>
<script src="includes/js/depend/scroll/asset/Tiling.js"></script>
<!-- End Open Source Libraries -->

<!-- Game Specific Code -->
<script src="includes/js/core.js"></script>
<script src="includes/js/depend/canvas.js"></script>
<script src="includes/js/depend/shapes.js"></script>
<script src="includes/js/depend/text.js"></script>
<script src="includes/js/depend/images.js"></script>
<script src="includes/js/depend/animation.js"></script>
<script src="includes/js/depend/dialog.js"></script>
<script src="includes/js/data/img_data.js"></script>
<script src="includes/js/data/modifiers.js"></script>
<script src="includes/js/data/building_data.js"></script>
<script src="includes/js/data/terr_data.js"></script>
<script src="includes/js/data/char_data.js"></script>
<script src="includes/js/data/colors.js"></script>
<script src="includes/js/data/levels.js"></script>
<script src="includes/js/classes/tileBased/buildings.js"></script>
<script src="includes/js/classes/tileBased/terrain.js"></script>
<script src="includes/js/classes/tileBased/char.js"></script>
<script src="includes/js/classes/tileBased/moves.js"></script>
<script src="includes/js/classes/tileBased/map.js"></script>
<script src="includes/js/classes/player.js"></script>
<script src="includes/js/classes/engine.js"></script>
<script src="includes/js/classes/ui.js"></script>
<script src="includes/js/classes/ai.js"></script>
<!-- End Game Specific Code -->