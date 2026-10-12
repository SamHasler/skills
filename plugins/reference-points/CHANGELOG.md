# Changelog

## 0.2.0

Option codes no longer restart under each question or decision: they are one sequence for the session, so `O41` names one option however long ago it was offered. After compaction the hook now restores the highest option code too.

## 0.1.0

First release. The Reference Points rules as a skill, injected into the main agent at session start, after `/clear` and after compaction, with the highest issued code per kind restored after compaction. After a compaction the agent continues above the higher of the restored codes and any code the compaction summary shows.
