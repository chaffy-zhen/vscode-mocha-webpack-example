import { assert } from "chai";
import { getRole, getUsers } from "@/index";

describe('Testing', ()=>{
  it('Packy is admin', ()=>{
    assert.equal(getRole('Packy'), 'admin');
  })
  it("Joan is reader", () => {
    assert.equal(getRole("Joan"), "reader");
  });
})

describe('GetUsers', ()=>{
  it('get result is Array', async ()=>{
    const users = await getUsers();
    assert.isArray(users, "[message]");
  })
})