# Changelog

## 0.2.3

The agent now keeps questions and steps out of subagent briefs as well as files. A brief states what a question or step contains, never its code or a paraphrase of it, and carries no codes of any kind. Before sending a brief or writing a file, the agent checks it for codes and for references to questions, options or steps.

Option codes are now chat only, like question and step codes. A decision written into a file names the chosen option and the rejected ones in words.

## 0.2.2

The status update rules no longer contradict each other. One rule says a message sent while the agent still has work running is a progress note and gets no status update. A later line said to give one update per turn, which read as compulsory. That line now says at most one update per turn.

## 0.2.1

When an answer creates or settles a decision, the agent now names both codes in chat (for example `D07 records Q12 O27`), so a transcript search for the decision finds the question behind it. Questions cannot cite a decision that did not exist when they were asked, so this link was missing before.

## 0.2.0

Option codes no longer restart under each question or decision: they are one sequence for the session, so `O41` names one option however long ago it was offered. After compaction the hook now restores the highest option code too.

## 0.1.0

First release. The Reference Points rules as a skill, injected into the main agent at session start, after `/clear` and after compaction, with the highest issued code per kind restored after compaction. After a compaction the agent continues above the higher of the restored codes and any code the compaction summary shows.
