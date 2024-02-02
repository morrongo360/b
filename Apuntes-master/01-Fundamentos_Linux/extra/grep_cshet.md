
<div class="section">
<p>Search standard output (i.e. a stream of text)</p>
<pre><code class="hljs language-shell"><span class="hljs-meta prompt_">$ </span><span class="language-bash">grep [options] search_string</span>
</code></pre>
<p>Search for an exact string in file:</p>
<pre><code class="hljs language-shell"><span class="hljs-meta prompt_">$ </span><span class="language-bash">grep [options] search_string path/to/file</span>
</code></pre>
<p>Print lines in myfile.txt containing the string "mellon"</p>
<pre><code class="hljs language-shell"><span class="hljs-meta prompt_">$ </span><span class="language-bash">grep <span class="hljs-string">'mellon'</span> myfile.txt</span>
</code></pre>
<p>Wildcards are accepted in filename.</p>
</div>
</div>
<div class="h3-wrap col-span-3">
<h3 id="option-examples"><a class="h-anchor" href="#option-examples">#</a>Option examples</h3>
<div class="section">
<table>
<thead>
<tr>
<th>Option</th>
<th>Example</th>
<th>Operation</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>-i</code></td>
<td>grep -i ^DA demo.txt</td>
<td>Forgets about case sensitivity</td>
</tr>
<tr>
<td><code>-w</code></td>
<td>grep -w "of" demo.txt</td>
<td>Search only for the full word</td>
</tr>
<tr>
<td><code>-A</code></td>
<td>grep -A 3 'Exception' error.log</td>
<td>Display 3 lines after matching string</td>
</tr>
<tr>
<td><code>-B</code></td>
<td>grep -B 4 'Exception' error.log</td>
<td>Display 4 lines before matching string</td>
</tr>
<tr>
<td><code>-C</code></td>
<td>grep -C 5 'Exception' error.log</td>
<td>Display 5 lines around matching string</td>
</tr>
<tr>
<td><code>-r</code></td>
<td>grep -r 'quickref.me' /var/log/nginx/</td>
<td>Recursive search <em>(within subdirs)</em></td>
</tr>
<tr>
<td><code>-v</code></td>
<td>grep -v 'warning' /var/log/syslog</td>
<td>Return all lines which don't match the pattern</td>
</tr>
<tr>
<td><code>-e</code></td>
<td>grep -e '^al' filename</td>
<td>Use regex <em>(lines starting with 'al')</em></td>
</tr>
<tr>
<td><code>-E</code></td>
<td>grep -E 'ja(s|cks)on' filename</td>
<td>Extended regex <em>(lines containing jason or jackson)</em></td>
</tr>
<tr>
<td><code>-c</code></td>
<td>grep -c 'error' /var/log/syslog</td>
<td>Count the number of matches</td>
</tr>
<tr>
<td><code>-l</code></td>
<td>grep -l 'robot' /var/log/*</td>
<td>Print the name of the file(s) of matches</td>
</tr>
<tr>
<td><code>-o</code></td>
<td>grep -o search_string filename</td>
<td>Only show the matching part of the string</td>
</tr>
<tr>
<td><code>-n</code></td>
<td>grep -n "go" demo.txt</td>
<td>Show the line numbers of the matches</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
<div class="h2-wrap cols-3">
<h2 id="grep-regular-expressions"><a class="h-anchor" href="#grep-regular-expressions">#</a>Grep regular expressions</h2>
<div class="h3-wrap-list">
<div class="h3-wrap">
<h3 id="refer"><a class="h-anchor" href="#refer">#</a>Refer</h3>
<div class="section">
<ul>
<li><a data-savepage-href="/regex" href="https://quickref.me/regex">Regex syntax</a> <em>(quickref.me)</em></li>
<li style="border-bottom: none;"><a data-savepage-href="/regex#regex-examples" href="https://quickref.me/regex#regex-examples">Regex examples</a> <em>(quickref.me)</em></li>
</ul>
<p>Please refer to the full version of the regex cheat sheet for more complex requirements.</p>
</div>
</div>
<div class="h3-wrap">
<h3 id="wildcards"><a class="h-anchor" href="#wildcards">#</a>Wildcards</h3>
<div class="section">
<table>
<thead>
<tr>
<th>-</th>
<th>-</th>
</tr>
</thead>
<tbody>
<tr>
<td>.</td>
<td>Any character.</td>
</tr>
<tr>
<td><code>?            </code></td>
<td>Optional and can only occur once.</td>
</tr>
<tr>
<td><code>*            </code></td>
<td>Optional and can occur more than once.</td>
</tr>
<tr>
<td><code>+            </code></td>
<td>Required and can occur more than once.</td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="h3-wrap">
<h3 id="quantifiers"><a class="h-anchor" href="#quantifiers">#</a>Quantifiers</h3>
<div class="section">
<table>
<thead>
<tr>
<th>-</th>
<th>-</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>{n}          </code></td>
<td>Previous item appears exactly n times.</td>
</tr>
<tr>
<td><code>{n,}         </code></td>
<td>Previous item appears n times or more.</td>
</tr>
<tr>
<td><code>{,m}         </code></td>
<td>Previous item appears n times maximum.</td>
</tr>
<tr>
<td><code>{n,m}        </code></td>
<td>Previous item appears between n and m times.</td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="h3-wrap">
<h3 id="posix"><a class="h-anchor" href="#posix">#</a>POSIX</h3>
<div class="section">
<table>
<thead>
<tr>
<th>-</th>
<th>-</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>[:alpha:]   </code></td>
<td>Any lower and upper case letter.</td>
</tr>
<tr>
<td><code>[:digit:]   </code></td>
<td>Any number.</td>
</tr>
<tr>
<td><code>[:alnum:]   </code></td>
<td>Any lower and upper case letter or digit.</td>
</tr>
<tr>
<td><code>[:space:]    </code></td>
<td>Any whites­pace.</td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="h3-wrap">
<h3 id="character"><a class="h-anchor" href="#character">#</a>Character</h3>
<div class="section">
<table>
<thead>
<tr>
<th>-</th>
<th>-</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>[A-Z­a-z]    </code></td>
<td>Any lower and upper case letter.</td>
</tr>
<tr>
<td><code>[0-9]        </code></td>
<td>Any number.</td>
</tr>
<tr>
<td><code>[0-9­A-Z­a-z]</code></td>
<td>Any lower and upper case letter or digit.</td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="h3-wrap">
<h3 id="position"><a class="h-anchor" href="#position">#</a>Position</h3>
<div class="section">
<table>
<thead>
<tr>
<th></th>
<th></th>
</tr>
</thead>
<tbody>
<tr>
<td><code>^ </code></td>
<td>Beginning of line.</td>
</tr>
<tr>
<td><code>$ </code></td>
<td>End of line.</td>
</tr>
<tr>
<td><code>^$</code></td>
<td>Empty line.</td>
</tr>
<tr>
<td><code>\&lt;</code></td>
<td>Start of word.</td>
</tr>
<tr>
<td><code>\&gt;</code></td>
<td>End of word.</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>