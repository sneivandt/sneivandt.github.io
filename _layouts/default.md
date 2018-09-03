<!doctype html>

<html lang="en">
<head>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

<title>{{page.title}}</title>
<meta name="description" content="Stuart Neivandt's personal website">
<meta name="author" content="Stuart Neivandt">
<meta name="theme-color" content="#343a40">

<link rel="apple-touch-icon" sizes="180x180" href="public/icons/apple-touch-icon.png">
<link rel="icon" type="image/x-icon" href="public/icons/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="public/icons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="public/icons/favicon-16x16.png">
<link rel="manifest" href="site.webmanifest">
<link rel="mask-icon" href="public/icons/safari-pinned-tab.svg" color="#5bbad5">
<meta name="msapplication-TileColor" content="#da532c">
<meta name="msapplication-TileImage" content="public/icons/mstile-144x144.png">
<meta name="theme-color" content="#ffffff">

<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
<link rel="stylesheet" href="public/css/styles.css">

</head>

<body>

<nav class="navbar navbar-inverse navbar-expand-lg navbar-dark bg-dark">
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
            <li class="nav-item">
                {% if page.url == "/" %}
                <a class="nav-link active" href="/">Home</a>
                {% else %}
                <a class="nav-link" href="/">Home</a>
                {% endif %}
            </li>
            <li class="nav-item">
                {% if page.url == "/resume.html" %}
                <a class="nav-link active" href="/resume">Resume</a>
                {% else %}
                <a class="nav-link" href="/resume">Resume</a>
                {% endif %}
            </li>
        </ul>
    </div>
</nav>    

<div class="container p-3">
<main role="main">
{{content}}
</main>
</div>

<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
<script src="public/js/load.js"></script>

</body>
</html>