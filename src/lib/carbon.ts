// Simple, transparent annual CO2 estimator (kg/year).
// Sources: rough IPCC/EPA averages — good enough for an in-app estimate.

export type OnboardingInput = {
  car_km_per_week: number;
  car_fuel_type: "petrol" | "diesel" | "hybrid" | "electric" | "none";
  flights_per_year: number;
  public_transport_km_per_week: number;
  household_size: number;
  electricity_kwh_per_month: number;
  renewable_energy: boolean;
  heating_type: "gas" | "electric" | "oil" | "heatpump" | "none";
  diet: "vegan" | "vegetarian" | "pescatarian" | "omnivore" | "heavy_meat";
  shopping_frequency: "low" | "medium" | "high";
  recycles: boolean;
  composts: boolean;
};

const CAR_EMISSIONS_KG_PER_KM: Record<OnboardingInput["car_fuel_type"], number> = {
  petrol: 0.192,
  diesel: 0.171,
  hybrid: 0.111,
  electric: 0.053,
  none: 0,
};

const FLIGHT_KG_EACH = 500; // avg medium-haul round trip
const PT_KG_PER_KM = 0.04;
const GRID_KG_PER_KWH = 0.4;

const HEATING_KG_PER_YEAR: Record<OnboardingInput["heating_type"], number> = {
  gas: 1800, electric: 1200, oil: 2400, heatpump: 500, none: 0,
};

const DIET_KG_PER_YEAR: Record<OnboardingInput["diet"], number> = {
  vegan: 1100, vegetarian: 1500, pescatarian: 1900, omnivore: 2500, heavy_meat: 3300,
};

const SHOPPING_KG: Record<OnboardingInput["shopping_frequency"], number> = {
  low: 600, medium: 1200, high: 2200,
};

export type CarbonBreakdown = {
  transport_kg: number;
  energy_kg: number;
  food_kg: number;
  goods_kg: number;
  total_kg: number;
};

export function estimateCarbon(i: OnboardingInput): CarbonBreakdown {
  const transport_kg =
    i.car_km_per_week * 52 * CAR_EMISSIONS_KG_PER_KM[i.car_fuel_type] +
    i.flights_per_year * FLIGHT_KG_EACH +
    i.public_transport_km_per_week * 52 * PT_KG_PER_KM;

  const householdShare = Math.max(1, i.household_size);
  const electricity = i.electricity_kwh_per_month * 12 * GRID_KG_PER_KWH;
  const renewableFactor = i.renewable_energy ? 0.2 : 1;
  const energy_kg = (electricity * renewableFactor + HEATING_KG_PER_YEAR[i.heating_type]) / householdShare;

  const food_kg = DIET_KG_PER_YEAR[i.diet];

  let goods_kg = SHOPPING_KG[i.shopping_frequency];
  if (i.recycles) goods_kg *= 0.85;
  if (i.composts) goods_kg *= 0.92;

  const total_kg = transport_kg + energy_kg + food_kg + goods_kg;
  return {
    transport_kg: Math.round(transport_kg),
    energy_kg: Math.round(energy_kg),
    food_kg: Math.round(food_kg),
    goods_kg: Math.round(goods_kg),
    total_kg: Math.round(total_kg),
  };
}

// Score 0-100 where 100 = very low footprint. Global avg ~4800kg, target ~2000kg.
export function carbonScore(total_kg: number): number {
  const clamped = Math.max(500, Math.min(15000, total_kg));
  const pct = 1 - (clamped - 500) / (15000 - 500);
  return Math.round(pct * 100);
}

export function tipsFor(input: OnboardingInput, b: CarbonBreakdown): string[] {
  const tips: string[] = [];
  if (b.transport_kg > 3000) tips.push("Try replacing one car trip per week with cycling or public transport.");
  if (input.flights_per_year > 2) tips.push("Consider rail or video calls in place of one flight this year.");
  if (b.energy_kg > 2000 && !input.renewable_energy) tips.push("Switch to a renewable electricity tariff to cut emissions ~80%.");
  if (input.diet === "heavy_meat" || input.diet === "omnivore") tips.push("Two plant-based dinners per week saves ~300kg CO₂ per year.");
  if (!input.recycles) tips.push("Recycling consistently can cut your goods footprint by ~15%.");
  if (!input.composts) tips.push("Composting food scraps reduces methane and your goods footprint.");
  if (tips.length === 0) tips.push("You're already doing great — keep tracking and aim for steady reductions.");
  return tips.slice(0, 4);
}
