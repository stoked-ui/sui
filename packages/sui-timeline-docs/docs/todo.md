---
title: TODO
---

### Function expansion

- [ ] Zoom timeline (can be achieved by controlling scale, do you need to provide external wheel callback?)
- [x] Pass in the time as a parameter when clicking
- [x] Migrate style rendering: from effects => props, providing more powerful style expansion capabilities
- [x] Allow custom time zone rendering capabilities


### Design development
- [ ] Consider how to be compatible with the following common frame animation editor interaction modes, and whether compatibility is necessary (the following is a preliminary consideration of compatible implementation solutions)
  - [ ] action data structure changes
    - [ ] Option 1: Convert the previous start and end to points collection
    - [ ] Option 2: Add new group concept to group actions
  - [ ] Runner multi-time unit adaptation capability (s/frame)
![aim](/assets/aim.png)
