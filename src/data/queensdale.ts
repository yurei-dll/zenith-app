import type { ContinentPoint, Heart } from "../domain/types";

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
