---
layout: default
title: Resume
work:
    -   
        company: Microsoft
        title: Software Engineer
        time: December 2017 to Present
        link: https://www.microsoft.com
    -   
        company: Cvent
        title: Software Engineer
        time: Febuary 2015 to December 2017
        link: https://cvent.com
    -   
        company: Cyclops EMR
        title: Software Devloper
        time: May 2013 to Febuary 2015
        link: http://cyclopsemr.com
edu:
    -
        college: The University of Texas at Dallas
        degree: Batchelors of Science in Computer Science
        time: Fall 2013
        link: https://utdallas.edu
skills:
    - C#
    - C/C++
    - Java
    - Azure
    - Docker
    - SQL
    - Powershell
    - Maven
    - Git
    - Windows
    - Linux
---

<section role="region">
<h3 class="h3">Work Experience</h3>
<ul class="list-group resume-list">
{% for i in page.work %}
<li class="list-group-item">
    <a class="h5" href="{{i.link}}">{{i.company}}</a>
    <div>{{i.title}}</div>
    <div>{{i.time}}</div>
</li>
{% endfor %}
</ul>
</section>

<section role="region">
<h3 class="h3">Education</h3>
<ul class="list-group resume-list">
{% for i in page.edu %}
<li class="list-group-item">
    <a class="h5" href="{{i.link}}">{{i.college}}</a>
    <div>{{i.degree}}</div>
    <div>{{i.time}}</div>
</li>
{% endfor %}
</ul>
</section>

<section role="region">
<h3 class="h3">Technical Skills</h3>
<ul class="list-group resume-list">
{% for i in page.skills %}
<li class="list-group-item">{{i}}</li>
{% endfor %}
</ul>
</section>
