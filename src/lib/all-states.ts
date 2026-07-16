/**
 * All 50 US States + DC — used for the /paycheck/ hub state grid.
 * Only states marked `live: true` have actual calculator pages built.
 */

export interface AllState {
  name: string;
  abbreviation: string;
  slug: string;
  live: boolean;
}

export const ALL_STATES: readonly AllState[] = [
  { name: "Alabama", abbreviation: "AL", slug: "alabama", live: false },
  { name: "Alaska", abbreviation: "AK", slug: "alaska", live: false },
  { name: "Arizona", abbreviation: "AZ", slug: "arizona", live: false },
  { name: "Arkansas", abbreviation: "AR", slug: "arkansas", live: false },
  { name: "California", abbreviation: "CA", slug: "california", live: true },
  { name: "Colorado", abbreviation: "CO", slug: "colorado", live: false },
  { name: "Connecticut", abbreviation: "CT", slug: "connecticut", live: false },
  { name: "Delaware", abbreviation: "DE", slug: "delaware", live: false },
  { name: "Florida", abbreviation: "FL", slug: "florida", live: true },
  { name: "Georgia", abbreviation: "GA", slug: "georgia", live: false },
  { name: "Hawaii", abbreviation: "HI", slug: "hawaii", live: false },
  { name: "Idaho", abbreviation: "ID", slug: "idaho", live: false },
  { name: "Illinois", abbreviation: "IL", slug: "illinois", live: false },
  { name: "Indiana", abbreviation: "IN", slug: "indiana", live: false },
  { name: "Iowa", abbreviation: "IA", slug: "iowa", live: false },
  { name: "Kansas", abbreviation: "KS", slug: "kansas", live: false },
  { name: "Kentucky", abbreviation: "KY", slug: "kentucky", live: false },
  { name: "Louisiana", abbreviation: "LA", slug: "louisiana", live: false },
  { name: "Maine", abbreviation: "ME", slug: "maine", live: false },
  { name: "Maryland", abbreviation: "MD", slug: "maryland", live: false },
  { name: "Massachusetts", abbreviation: "MA", slug: "massachusetts", live: false },
  { name: "Michigan", abbreviation: "MI", slug: "michigan", live: false },
  { name: "Minnesota", abbreviation: "MN", slug: "minnesota", live: false },
  { name: "Mississippi", abbreviation: "MS", slug: "mississippi", live: false },
  { name: "Missouri", abbreviation: "MO", slug: "missouri", live: false },
  { name: "Montana", abbreviation: "MT", slug: "montana", live: false },
  { name: "Nebraska", abbreviation: "NE", slug: "nebraska", live: false },
  { name: "Nevada", abbreviation: "NV", slug: "nevada", live: false },
  { name: "New Hampshire", abbreviation: "NH", slug: "new-hampshire", live: false },
  { name: "New Jersey", abbreviation: "NJ", slug: "new-jersey", live: false },
  { name: "New Mexico", abbreviation: "NM", slug: "new-mexico", live: false },
  { name: "New York", abbreviation: "NY", slug: "new-york", live: true },
  { name: "North Carolina", abbreviation: "NC", slug: "north-carolina", live: false },
  { name: "North Dakota", abbreviation: "ND", slug: "north-dakota", live: false },
  { name: "Ohio", abbreviation: "OH", slug: "ohio", live: false },
  { name: "Oklahoma", abbreviation: "OK", slug: "oklahoma", live: false },
  { name: "Oregon", abbreviation: "OR", slug: "oregon", live: false },
  { name: "Pennsylvania", abbreviation: "PA", slug: "pennsylvania", live: true },
  { name: "Rhode Island", abbreviation: "RI", slug: "rhode-island", live: false },
  { name: "South Carolina", abbreviation: "SC", slug: "south-carolina", live: false },
  { name: "South Dakota", abbreviation: "SD", slug: "south-dakota", live: false },
  { name: "Tennessee", abbreviation: "TN", slug: "tennessee", live: false },
  { name: "Texas", abbreviation: "TX", slug: "texas", live: true },
  { name: "Utah", abbreviation: "UT", slug: "utah", live: false },
  { name: "Vermont", abbreviation: "VT", slug: "vermont", live: false },
  { name: "Virginia", abbreviation: "VA", slug: "virginia", live: false },
  { name: "Washington", abbreviation: "WA", slug: "washington", live: false },
  { name: "West Virginia", abbreviation: "WV", slug: "west-virginia", live: false },
  { name: "Wisconsin", abbreviation: "WI", slug: "wisconsin", live: false },
  { name: "Wyoming", abbreviation: "WY", slug: "wyoming", live: false },
];