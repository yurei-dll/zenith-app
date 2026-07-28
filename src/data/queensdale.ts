import type { ContinentPoint, Heart, PointOfInterest, ZoneMap } from "../domain/types";

export const QUEENSDALE = {
  id: 15,
  name: "Queensdale",
  bounds: [[42624, 28032], [46208, 30464]] as const satisfies readonly [
    ContinentPoint,
    ContinentPoint,
  ],
  center: [44416, 29248] as const satisfies ContinentPoint,
};

export const QUEENSDALE_HEARTS: Heart[] = [
  { id: 211, name: "Help the Seraph protect Claypool from centaurs.", level: 9, coordinate: [44063.9, 29886.6] },
  { id: 212, name: "Train with the militia.", level: 8, coordinate: [43550.7, 30028] },
  { id: 213, name: "Assist the Seraph at Shaemoor Garrison.", level: 6, coordinate: [44142.2, 28815.7] },
  { id: 214, name: "Help Lexi Price protect the trade route.", level: 7, coordinate: [44087.8, 29386.4] },
  { id: 215, name: "Help Diah tend her farm.", level: 2, coordinate: [43244.7, 28723.5] },
  { id: 216, name: "Help Fisher Travis maintain the river.", level: 2, coordinate: [43236.7, 28382.2] },
  { id: 218, name: "Help Foreman Flannum improve dam safety.", level: 3, coordinate: [43330.3, 28324.2] },
  { id: 219, name: "Assist Farmer Eda with her orchard.", level: 4, coordinate: [42834.8, 28302.3] },
  { id: 220, name: "Help Cassie around the moa ranch.", level: 5, coordinate: [42822.6, 28780] },
  { id: 221, name: "Protect Beetletun farmers from Tamini centaurs.", level: 12, coordinate: [45750.9, 28964.1] },
  { id: 222, name: "Help the citizens of Beetletun maintain their town.", level: 13, coordinate: [45852.1, 28430] },
  { id: 223, name: "Unite the ettins.", level: 14, coordinate: [45662.7, 30062.8] },
  { id: 224, name: "Help Historian Garrod investigate Godslost Swamp.", level: 15, coordinate: [44988.9, 29668.7] },
  { id: 225, name: "Keep the monastery operational.", level: 11, coordinate: [45225.9, 29229.5] },
  { id: 226, name: "Assist Laborer Cardy and Ojon's lumbermill.", level: 8, coordinate: [44598.1, 28755.7] },
  { id: 227, name: "Assist Hunter Block and the hunting lodge.", level: 9, coordinate: [45266.7, 28533.4] },
  { id: 228, name: "Assist Fisherman Will and the fishermen of Beetletun.", level: 10, coordinate: [45600.2, 28218.9] },
];

const QUEENSDALE_LANDMARKS: Array<Omit<PointOfInterest, "kind">> = [
  { id: 127, name: "Eda's Orchard", coordinate: [42830.7, 28406.7] },
  { id: 128, name: "Mepi's Moa Ranch", coordinate: [42845.6, 28728.5] },
  { id: 129, name: "Jeb's Wheatfield", coordinate: [43185.6, 28652.4] },
  { id: 130, name: "Dalin's Pumping Station", coordinate: [43400.7, 29097.2] },
  { id: 131, name: "Altar Brook Trading Post", coordinate: [44065.5, 29380.8] },
  { id: 132, name: "Altar Brook Crossing", coordinate: [43709.1, 29563.7] },
  { id: 133, name: "Hunting Lodge", coordinate: [45312, 28554.8] },
  { id: 134, name: "Eldvin Monastery", coordinate: [45185.3, 29265.2] },
  { id: 135, name: "Holdland Camp", coordinate: [45517.1, 29263.3] },
  { id: 136, name: "Hidden Cliff Camp", coordinate: [46077.5, 29534.1] },
  { id: 137, name: "Cliffwatch Camp", coordinate: [45658.4, 29619.7] },
  { id: 138, name: "Deathroot Shack", coordinate: [44911.2, 29856.2] },
  { id: 139, name: "Temple of the Ages", coordinate: [45150.8, 29776.4] },
  { id: 140, name: "Righteous Hoofmoot", coordinate: [45880.1, 30171.8] },
  { id: 835, name: "Bonegrinder's Gully", coordinate: [45565.6, 30320.7] },
  { id: 851, name: "Trainer's Terrace", coordinate: [43626.4, 28710.2] },
  { id: 1672, name: "Kappa's Corral", coordinate: [45041.2, 28957] },
  { id: 1673, name: "Beetletun Waterworks", coordinate: [45607.8, 28867.8] },
  { id: 1674, name: "Greatheart Weald", coordinate: [44258, 29700.6] },
  { id: 1675, name: "Bar Curtis Ranch", coordinate: [43215.5, 29722.4] },
  { id: 1676, name: "Duran Brothers' Docks", coordinate: [43110.4, 30146.3] },
];

export const QUEENSDALE_POIS: PointOfInterest[] = QUEENSDALE_LANDMARKS.map(
  (point) => ({ ...point, kind: "landmark" }),
);

export const QUEENSDALE_MAP: ZoneMap = {
  id: QUEENSDALE.id,
  name: QUEENSDALE.name,
  minLevel: 1,
  maxLevel: 15,
  continentId: 1,
  continentName: "Tyria",
  floorId: 1,
  regionId: 4,
  regionName: "Kryta",
  continentDimensions: [81920, 114688],
  minZoom: 0,
  maxZoom: 7,
  mapRect: [[-43008, -27648], [43008, 30720]],
  continentRect: QUEENSDALE.bounds,
  center: QUEENSDALE.center,
  hearts: QUEENSDALE_HEARTS,
  pointsOfInterest: QUEENSDALE_POIS,
};
