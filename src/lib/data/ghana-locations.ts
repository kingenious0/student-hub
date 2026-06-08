export interface GhanaLocation {
  region: string
  towns: string[]
}

export const ghanaLocations: GhanaLocation[] = [
  {
    region: "Greater Accra",
    towns: [
      "Accra", "Tema", "Ashaiman", "Madina", "Adenta", "La", "Korle Gonno",
      "Osu", "Cantonments", "East Legon", "Dansoman", "Dzorwulu",
      "Spintex", "Labadi", "Nungua", "Teshie", "Kaneshie", "Achimota",
      "Weija", "Kasoa", "Amasaman", "Pokuase", "Kwabenya", "Abokobi"
    ]
  },
  {
    region: "Ashanti",
    towns: [
      "Kumasi", "Obuasi", "Oduom", "Ejisu", "Mampong", "Konongo",
      "Suame", "Asawase", "Tafo", "Bantama", "Manhyia", "Kwadaso",
      "Sofo Line", "Ahinsan", "Ayeduase", "Bomso", "Amakom",
      "Adum", "Kejetia", "Fumesua", "Afari", "Atonsu"
    ]
  },
  {
    region: "Western",
    towns: [
      "Sekondi", "Takoradi", "Tarkwa", "Bogoso", "Prestea", "Axim",
      "Half Assini", "Essikado", "Enchi", "Wassa Akropong", "Daboase",
      "Asanta", "Efia Nkwanta", "Kojokrom", "Nkroful"
    ]
  },
  {
    region: "Western North",
    towns: [
      "Sefwi Wiawso", "Bibiani", "Sefwi Bekwai", "Anhwiaso", "Ahokwa",
      "Bodi", "Adabokrom", "Debiso", "Dadieso"
    ]
  },
  {
    region: "Central",
    towns: [
      "Cape Coast", "Mankessim", "Winneba", "Kasoa", "Elmina",
      "Agona Swedru", "Dunkwa", "Assin Fosu", "Apam", "Saltpond",
      "Abura", "Nkawkaw", "Ayanfuri", "Budumburam", "Gomoa Dawurampong"
    ]
  },
  {
    region: "Volta",
    towns: [
      "Ho", "Hohoe", "Aflao", "Keta", "Kpando", "Akatsi",
      "Denu", "Anloga", "Dzodze", "Abor", "Sogakope",
      "Awudome", "Agortime", "Leklebi", "Fesi"
    ]
  },
  {
    region: "Oti",
    towns: [
      "Dambai", "Jasikan", "Nkwanta", "Kadjebi", "Kete Krachi",
      "Ntsinsu", "Brewaniase", "Chaiso", "Gyankunde"
    ]
  },
  {
    region: "Eastern",
    towns: [
      "Koforidua", "Akropong", "Aburi", "Mampong Akwapim", "Nsawam",
      "Suhum", "Asamankese", "Oda", "Akosombo", "Donkorkrom",
      "Begoro", "New Tafo", "Anum", "Somanya", "Kibi"
    ]
  },
  {
    region: "Brong Ahafo",
    towns: [
      "Sunyani", "Techiman", "Berekum", "Dormaa Ahenkro", "Wenchi",
      "Atebubu", "Kintampo", "Nkoranza", "Bechem", "Duayaw Nkwanta",
      "Goaso", "Kenyasi", "Sankore", "Kwame Danso", "Yamfo"
    ]
  },
  {
    region: "Bono East",
    towns: [
      "Techiman", "Kintampo", "Nkoranza", "Atebubu", "Yeji",
      "Pru", "Sene", "Kawampe", "Tainso"
    ]
  },
  {
    region: "Ahafo",
    towns: [
      "Goaso", "Kenyasi", "Sankore", "Bechem", "Duayaw Nkwanta",
      "Hwidiem", "Mim", "Tepa", "Ayomso"
    ]
  },
  {
    region: "Northern",
    towns: [
      "Tamale", "Savelugu", "Yendi", "Kpandai", "Bimbilla",
      "Gushiegu", "Sagnerigu", "Tolon", "Karaga", "Zabzugu",
      "Wulensi", "Tatale", "Saboba", "Chereponi"
    ]
  },
  {
    region: "Savannah",
    towns: [
      "Damango", "Salaga", "Bole", "Sawla", "Kpalbe",
      "Larabanga", "Sefsibi", "Fulfoso", "Daboya"
    ]
  },
  {
    region: "North East",
    towns: [
      "Nalerigu", "Walewale", "Gambaga", "Chereponi", "Yunyoo",
      "Bunkpurugu", "Nakpanduri", "Kpasamkpe"
    ]
  },
  {
    region: "Upper East",
    towns: [
      "Bolgatanga", "Navrongo", "Bawku", "Paga", "Zuarungu",
      "Tongo", "Bongo", "Binduri", "Pusiga", "Garu"
    ]
  },
  {
    region: "Upper West",
    towns: [
      "Wa", "Jirapa", "Lawra", "Nadowli", "Tumu",
      "Wechiau", "Funsi", "Nandom", "Lambussie"
    ]
  }
]

export function getRegions(): string[] {
  return ghanaLocations.map(l => l.region)
}

export function getTowns(region: string): string[] {
  const loc = ghanaLocations.find(
    l => l.region.toLowerCase() === region.toLowerCase()
  )
  return loc?.towns ?? []
}

export function isValidLocation(region: string, town: string): boolean {
  return getTowns(region).some(
    t => t.toLowerCase() === town.toLowerCase()
  )
}

export const serviceCategories = [
  "Tutoring",
  "Photography",
  "Graphic Design",
  "Web Development",
  "Event Planning",
  "Cleaning",
  "Fitness Training",
  "Hair & Beauty",
  "Handyman",
  "Transport",
  "Pet Care",
  "Music Lessons",
  "Catering",
  "Laundry",
  "Shopping",
  "Food & Meals",
  "Other"
] as const
