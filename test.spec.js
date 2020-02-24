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

function Member({ id, password }) {
  this.id = id;
  this.password = password;
  return;
}

describe("GlobalMemberStore", () => {
  it("exists", () => expect(GlobalMemberStore.getMember).toBeTruthy());
  it("cannot be reassigned or mutated", () => {
    try {
      eval(`GlobalMemberStore = {}`);
    } catch (e) {
      expect(e.message).toBe("Assignment to constant variable.");
    }
    GlobalMemberStore.getMember = undefined;
    expect(GlobalMemberStore.getMember).not.toBe(undefined);
  });
  it("returns an empty array when empty", () => {
    GlobalMemberStore.setMembers([]);
    expect(Array.isArray(GlobalMemberStore.getMembers())).toBe(true);
  });
  it("accepts an array of members to hydrate the state", () => {
    GlobalMemberStore.setMembers([
      { id: 1, password: "123" },
      { id: 2, password: "secret" }
    ]);
    expect(GlobalMemberStore.getMembers().length).toBe(2);
  });
  it("returns a copy of the state array", () => {
    GlobalMemberStore.setMembers([
      { id: 1, password: "123" },
      { id: 2, password: "secret" }
    ]);
    const state = GlobalMemberStore.getMembers();
    expect(state.length).toBe(2);
    state.pop();
    expect(state.length).toBe(1);
    expect(GlobalMemberStore.getMembers().length).toBe(2);
  });
  it("returns copies of the state objects from getMembers()", () => {
    GlobalMemberStore.setMembers([
      { id: 1, password: "123" },
      { id: 2, password: "secret" }
    ]);
    const state = GlobalMemberStore.getMembers();
    expect(state.length).toBe(2);
    state[0].password = "nope!";
    const stateNow = GlobalMemberStore.getMembers();
    expect(stateNow.filter(m => m.password === "nope!").length).toBe(0);
    expect(GlobalMemberStore.getMembers().length).toBe(2);
  });
  it("can get a member by id", () => {
    GlobalMemberStore.setMembers([
      { id: 1, password: "123" },
      { id: 2, password: "secret" }
    ]);
    expect(GlobalMemberStore.getMember(1).found).toBe(true);
    expect(GlobalMemberStore.getMember(1).member.password).toBe("123");
  });
  it("returns {found: false} if no member is found", () => {
    GlobalMemberStore.setMembers([
      { id: 1, password: "123" },
      { id: 2, password: "secret" }
    ]);
    expect(GlobalMemberStore.getMember(10).found).toBe(false);
    expect(GlobalMemberStore.getMember(10).member).toBe(undefined);
  });
  it("returns a copy of the object via getMember()", () => {
    GlobalMemberStore.setMembers([
      { id: 1, password: "123" },
      { id: 2, password: "secret" }
    ]);
    const res = GlobalMemberStore.getMember(1);
    expect(res.found).toBe(true);
    res.member.password = "nope!";
    expect(GlobalMemberStore.getMember(1).member.password).toBe("123");
  });
  it("can update a member via the API", () => {
    GlobalMemberStore.setMembers([
      { id: 1, password: "123" },
      { id: 2, password: "secret" }
    ]);
    const res = GlobalMemberStore.getMember(1);
    expect(res.found).toBe(true);
    res.member.password = "nope!";
    GlobalMemberStore.updateMember(res.member);
    expect(GlobalMemberStore.getMember(1).member.password).toBe("nope!");
  });
  it("can put a new member", () => {
    GlobalMemberStore.setMembers([
      { id: 1, password: "123" },
      { id: 2, password: "secret" }
    ]);
    GlobalMemberStore.putMember({ id: 3, password: "new" });
    expect(GlobalMemberStore.getMember(3).member.password).toBe("new");
    expect(GlobalMemberStore.getMembers().length).toBe(3);
  });
  it("throws if you put a duplicate id", () => {
    GlobalMemberStore.setMembers([
      { id: 1, password: "123" },
      { id: 2, password: "secret" }
    ]);
    try {
      GlobalMemberStore.putMember({ id: 1, password: "duplicate!" });
    } catch (e) {
      expect(e.message).toBe("1 already exists!");
    }
  });
  it("throws if you put undefined", () => {
    try {
      GlobalMemberStore.putMember(undefined);
    } catch (e) {
      expect(e.message).toBe("Undefined passed as argument to Store!");
    }
  });
  it("throws if you put a member with an undefined id", () => {
    try {
      GlobalMemberStore.putMember({ password: "something" });
    } catch (e) {
      expect(e.message).toBe(
        "Undefined id on member passed as argument to Store!"
      );
    }
  });
  it("throws if you try to find undefined (probably an error in the calling code)", () => {
    try {
      GlobalMemberStore.getMember(undefined);
    } catch (e) {
      expect(e.message).toBe("Undefined passed as argument to Store!");
    }
  });
});
