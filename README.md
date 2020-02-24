# Avoiding global mutable state in browser JS

This is the accompanying repo for the article "[Avoiding global mutable state in browser JS](https://www.joshwulf.com/blog/2020/02/avoid-global-state/)", demonstrating an immutable global store that encapsulates state and business validation rules in [40 lines of code](test.spec.js).

The article is part of my [StackOverflowed series](https://www.joshwulf.com/categories/stackoverflowed/), where I refactor code from StackOverflow questions, with commentary on what I'm doing and why.

The original code that I refactored this from was:

```
var memArray = []
```

I converted it to 40 lines of code that encapsulates the entire expected usage of this array in the application with an API, and 125 lines of unit tests that prove its functionality.

## To test

* Clone this git repo
* Install deps with: `pnpm i` or `npm i`
* Run tests with: `jest`

## The code

Here is the entire implementation:

```
const GlobalMemberStore = (() => {
  let _members = [];
  const needsArg = arg => {
    if (!arg) {
      throw new Error(`Undefined passed as argument to Store!`);
    }
    return arg;
  };
  const needsId = member => {
    if (!member.id) {
      throw new Error(`Undefined id on member passed as argument to Store!`);
    }
    return member;
  };
  const Store = {
    setMembers: members => (_members = members.map(m => ({ ...m }))),
    getMembers: () => _members.map(m => ({ ...m })),
    getMember: id => {
      const member = _members.filter(m => m.id === id);
      return member.length === 1
        ? { found: true, member: { ...member[0] } }
        : { found: false, member: undefined };
    },
    putMember: member => {
      const m = needsId(needsArg(member));
      if (Store.getMember(m.id).found) {
        throw new Error(`${m.id} already exists!`);
      }
      _members = [..._members, { ...m }];
    },
    updateMember: update => {
      const u = needsId(needsArg(update));
      if (!Store.getMember(u.id).found) {
        throw new Error(`${u.id} does not exists!`);
      }
      _members = _members.map(m => (m.id === u.id ? update : m));
    }
  };
  return Object.freeze(Store);
})();
```
