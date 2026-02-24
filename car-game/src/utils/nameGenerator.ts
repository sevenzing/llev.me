const ADJECTIVES = [
  "Brave", "Swift", "Clever", "Bold", "Fierce", "Quick", "Sneaky", "Wild",
  "Calm", "Daring", "Fuzzy", "Grumpy", "Happy", "Icy", "Jolly", "Keen",
  "Lucky", "Mighty", "Noble", "Odd", "Proud", "Quirky", "Rusty", "Sly",
  "Tiny", "Unstoppable", "Vibrant", "Witty", "Zany", "Cosmic", "Electric",
  "Frozen", "Glowing", "Hyper", "Iron", "Jazzy", "Laser", "Mega", "Neon",
];

const ANIMALS = [
  "Fox", "Bear", "Wolf", "Hawk", "Lynx", "Orca", "Puma", "Raven",
  "Tiger", "Viper", "Eagle", "Cobra", "Deer", "Elk", "Falcon", "Goat",
  "Hare", "Ibis", "Jaguar", "Koala", "Lemur", "Moose", "Newt", "Owl",
  "Panda", "Quail", "Robin", "Shark", "Toad", "Urial", "Vole", "Wasp",
  "Xenops", "Yak", "Zebu", "Bison", "Crane", "Dingo", "Egret",
];

export function generateName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj} ${animal}`;
}
