import test from "node:test";
import assert from "node:assert/strict";
import { lngLatToTile, tileToLngLat, getVisibleTiles } from "../src/lib/mapTiles.js";
import { getShipCoordinates, getShipDetailsNavigation, getDetailsReturnTarget } from "../src/lib/shipNavigation.js";

test("tile coordinates wrap at the dateline and clamp at the poles", () => {
  assert.deepEqual(lngLatToTile(180, 90, 3), {z:3,x:0,y:0});
  assert.deepEqual(lngLatToTile(-540, -90, 3), {z:3,x:0,y:7});
  for (let z = 2; z <= 19; z++) {
    const count = 2 ** z;
    const tile = { z, x: Math.floor(count * 0.74), y: Math.floor(count * 0.35) };
    const [lng, lat] = tileToLngLat(z, tile.x + 0.5, tile.y + 0.5);
    assert.deepEqual(lngLatToTile(lng, lat, z), tile);
  }
});

test("visible tiles include both sides of the dateline without duplicates", () => {
  const map = (west,east,north,south) => ({
    getZoom: () => 3.7,
    getBounds: () => ({getWest:()=>west,getEast:()=>east,getNorth:()=>north,getSouth:()=>south}),
  });
  const crossing = getVisibleTiles(map(170,-170,10,-10));
  assert.deepEqual(new Set(crossing.map(tile=>tile.x)), new Set([7,0]));
  const world = getVisibleTiles(map(-540,540,90,-90));
  assert.equal(world.length, 64);
  assert.equal(new Set(world.map(({z,x,y})=>[z,x,y].join("/"))).size,64);
});

test("ship coordinates keep source records intact and reject absent positions", () => {
  const ship = {id:0,lat:"31.2304",lon:"121.4737",vessel_type:"Cargo"};
  const snapshot = JSON.stringify(ship);
  assert.deepEqual(getShipCoordinates(ship),[121.4737,31.2304]);
  assert.equal(JSON.stringify(ship),snapshot);
  for (const bad of [{}, {lat:null,lon:0}, {lat:"",lon:0}, {lat:91,lon:0}, {lat:"bad",lon:0}]) assert.equal(getShipCoordinates(bad),null);
  assert.deepEqual(getShipCoordinates({latitude:0,longitude:0}),[0,0]);
});

test("details links preserve selection and distinguish map from table returns", () => {
  const ship = {id:42,lat:0,lon:0};
  for (const [source,returnTo] of [["map","/dashboard/8/214/106?shipId=42"],["table","/ships"],["table","/voyage"]]) {
    const navigation = getShipDetailsNavigation(ship,{source,returnTo});
    assert.equal(navigation.state.ship,ship);
    const search = navigation.to.slice(navigation.to.indexOf("?"));
    assert.equal(getDetailsReturnTarget(search),returnTo);
    assert.equal(getDetailsReturnTarget(search,navigation.state),returnTo);
  }
  for (const returnTo of ["https://example.com","//example.com","/ships/42","/dashboard/8/214/106"]) {
    assert.equal(getDetailsReturnTarget("?from=table&returnTo="+encodeURIComponent(returnTo)),"/ships");
  }
});
