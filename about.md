---
layout: default
title: About
sections:
    -
        items:
            -
                line1: Hello, my name is <b>Stuart Neivandt</b>, and I live in Bellevue, Washington. I sometimes play and often enjoy listening to music. I currently work for Microsoft on role-based access control for Azure.
    -   
        title: Employer
        items: 
            -    
                title: Microsoft
                link: https://www.microsoft.com
                line1: Software Engineer
                line2: Since December 2017
    -
        title: Education
        items: 
            -
                title: The University of Texas at Dallas
                link: https://utdallas.edu
                line1: Bachelors of Science in Computer Science
---

{% for section in page.sections %}
<section role="region">
<h3 class="h3">{{section.title}}</h3>
<ul class="list-group pb-3">
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