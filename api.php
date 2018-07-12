<?php

$route = $_GET['route'];

$topListFilePath = './toplist.json';
// 读文件
$file = file_get_contents($topListFilePath);
$data = json_decode($file);

if ($route === 'saveScore') {
	$post = $_POST;

	$name = addslashes(trim($post['name']));
	$score = intval($post['score']);

	// 插入数据
	$data[] = [ 'name' => $name, 'score' => $score ];

	// 写文件
	file_put_contents($topListFilePath, json_encode($data));

	echo json_encode([
		'state' => 1,
		'msg' => '成绩已经保存'
	]);
}

if ($route === 'toplist') {
}