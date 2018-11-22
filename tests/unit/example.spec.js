import { assert } from "chai";
import { getRole } from "@/index";

describe('Testing', ()=>{
  it('Packy is admin', ()=>{
    assert.equal(getRole('Packy'), 'admin');
  })
  it("Joan is reader", () => {
    assert.equal(getRole("Joan"), "reader");
  });
})