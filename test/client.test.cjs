const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');
let moduleDefinition;
const React = {createElement(){}};
const context = {window:{__ModuleLoader__:{load(value){moduleDefinition=value;}}}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../client.js'),'utf8'),context);
const plugin = moduleDefinition.factory(name=>{assert.equal(name,'react');return React;});
const row = (id,running,updatedAt=1,extra={})=>Object.freeze({id,running,updatedAt,displayTitle:id,...extra});
const list = rows=>({byId:Object.fromEntries(rows.map(value=>[value.id,value])),ids:rows.map(value=>value.id),phase:'ready'});
const ids = result=>Array.from(result,value=>value.id);
test('only active conversations and newest first',()=>{
  const state=list([row('idle',false),row('a',true,10),row('b',true,20)]);
  assert.deepEqual(ids(plugin.selectActive(state,new Map())),['b','a']);
  assert.deepEqual(state.ids,['idle','a','b']);
});
test('live status overrides stale catalog in both directions',()=>{
  const state=list([row('stopped',true),row('started',false)]);
  assert.deepEqual(ids(plugin.selectActive(state,new Map([['stopped',{running:false}],['started',{running:true}]]))),['started']);
});
test('unknown live running uses catalog fallback',()=>{
  assert.deepEqual(ids(plugin.selectActive(list([row('active',true)]),new Map([['active',{running:undefined}]]))),['active']);
});
test('awaiting interaction counts even when not running',()=>{
  assert.deepEqual(ids(plugin.selectActive(list([row('question',false)]),new Map([['question',{running:false,pendingInteraction:{kind:'question'}}]]))),['question']);
});
test('includes catalog subagents and handles empty list',()=>{
  assert.deepEqual(ids(plugin.selectActive(list([row('child',true,1,{parentId:'parent',origin:'subagent'})]),new Map())),['child']);
  assert.deepEqual(ids(plugin.selectActive(list([]),new Map())),[]);
});
test('ties sort deterministically',()=>{
  assert.deepEqual(ids(plugin.selectActive(list([row('b',true),row('a',true)]),new Map())),['a','b']);
});
test('registers additive slots, locale, and disposal-owned resources',()=>{
  const registrations=[];const disposers=[];const localeCalls=[];
  plugin.apply({locale:{register(...args){localeCalls.push(args);return ()=>localeCalls.push('disposed');},bind(){return key=>key;}},uiWorkspace:{openSession(){}},effect(fn){const dispose=fn();if(typeof dispose==='function')disposers.push(dispose);},slots:{inject(name,fn){const dispose=fn();disposers.push(dispose);},register(options,view){registrations.push({options,view});return ()=>registrations.pop();}}});
  assert.equal(registrations.length,3);
  assert.deepEqual(registrations.map(value=>value.options.name),['sidebar.footer.action','shell.overlay','shell.overlay']);
  assert.equal(localeCalls[0][0],'dsh-running-sessions');
  for(const dispose of disposers.reverse())dispose();
  assert.equal(registrations.length,0);
  assert.equal(localeCalls.at(-1),'disposed');
});
