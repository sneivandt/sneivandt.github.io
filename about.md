---
layout: default
title: About
sections:
    -   
        title: Employer
        items: 
            -    
                title: Microsoft
                link: https://www.microsoft.com
                line1: Software Engineer
                line2: December 2017 to Present
    -
        title: Education
        items: 
            -
                title: The University of Texas at Dallas
                link: https://utdallas.edu
                line1: Bachelors of Science in Computer Science
                line2: Fall 2013
---

{% for section in page.sections %}
<section role="region">
<h3 class="h3">{{section.title}}</h3>
<ul class="list-group padded-list">
{% for item in section.items %}
<li class="list-group-item">
    <a class="h5" href="{{item.link}}">{{item.title}}</a>
    <div>{{item.line1}}</div>
    <div>{{item.line2}}</div>
</li>
{% endfor %}
</ul>
</section>
{% endfor %}