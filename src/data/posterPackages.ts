export interface PosterPackage {
  id: number;
  title: string;
  subject: string;
  tags: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  image_url2?: string;
  poster_count: string;
  poster_qty: number;
}

export const POSTER_PACKAGES: PosterPackage[] = [
  {
    id: 9001,
    title: "Short Subject Combo",
    subject: "Short Subject Combo",
    tags: "combo, short, radiology, psychiatry, anesthesia, dermatology, orthopaedics, forensic, paediatrics",
    description: "High-yield rapid revision posters covering 7 short subjects: Radiology, Psychiatry, Anesthesia, Dermatology, Orthopaedics, Forensic Medicine & Toxicology, and Paediatrics.",
    price: 549,
    original_price: 850,
    poster_count: "7 Subjects",
    poster_qty: 7,
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600"
  },
  {
    id: 9002,
    title: "Pathology + Microbiology Combo",
    subject: "Medium Subject Combo",
    tags: "combo, medium, pathology, microbiology",
    description: "Pathology (2 posters) + Microbiology (2 posters). High-yield pathology and microbiology revision for NEET PG.",
    price: 319,
    original_price: 499,
    poster_count: "4 Posters",
    poster_qty: 4,
    image_url: "/posters/pathology.png",
    image_url2: "/posters/microbiology.png"
  },
  {
    id: 9003,
    title: "Biochemistry + Pharmacology Combo",
    subject: "Medium Subject Combo",
    tags: "combo, medium, biochemistry, pharmacology",
    description: "Biochemistry (2 posters) + Pharmacology (2 posters). Master metabolic pathways and drug pharmacology for NEET PG.",
    price: 319,
    original_price: 499,
    poster_count: "4 Posters",
    poster_qty: 4,
    image_url: "/posters/biochem.png",
    image_url2: "/posters/pharmacology.png"
  },
  {
    id: 9004,
    title: "Anatomy + Physiology Combo",
    subject: "Medium Subject Combo",
    tags: "combo, medium, anatomy, physiology",
    description: "Anatomy (2 posters) + Physiology (2 posters). Comprehensive basic sciences revision combo for NEET PG.",
    price: 319,
    original_price: 499,
    poster_count: "4 Posters",
    poster_qty: 4,
    image_url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600"
  },
  {
    id: 9005,
    title: "ENT + Ophthalmology Combo",
    subject: "Medium Subject Combo",
    tags: "combo, medium, ent, ophthalmology",
    description: "ENT (2 posters) + Ophthalmology (2 posters). High-yield revision for core clinical specialities.",
    price: 319,
    original_price: 499,
    poster_count: "4 Posters",
    poster_qty: 4,
    image_url: "/posters/ent.png",
    image_url2: "/posters/ophthalmology.png"
  },
  {
    id: 9006,
    title: "Obstetrics & Gynaecology Pack",
    subject: "Long Subject Pack",
    tags: "long, obg, gynecology, obstetrics",
    description: "4 high-yield revision posters dedicated to Obstetrics & Gynaecology for NEET PG.",
    price: 319,
    original_price: 499,
    poster_count: "4 Posters",
    poster_qty: 4,
    image_url: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600"
  },
  {
    id: 9007,
    title: "General Medicine Pack",
    subject: "Long Subject Pack",
    tags: "long, medicine",
    description: "4 high-yield revision posters dedicated to General Medicine for NEET PG.",
    price: 319,
    original_price: 499,
    poster_count: "4 Posters",
    poster_qty: 4,
    image_url: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=600"
  },
  {
    id: 9008,
    title: "General Surgery Pack",
    subject: "Long Subject Pack",
    tags: "long, surgery",
    description: "4 high-yield revision posters dedicated to General Surgery for NEET PG.",
    price: 319,
    original_price: 499,
    poster_count: "4 Posters",
    poster_qty: 4,
    image_url: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600"
  },
  {
    id: 9009,
    title: "Community Medicine Pack",
    subject: "Long Subject Pack",
    tags: "long, psm, community-medicine",
    description: "4 high-yield revision posters dedicated to Community Medicine (PSM) for NEET PG.",
    price: 319,
    original_price: 499,
    poster_count: "4 Posters",
    poster_qty: 4,
    image_url: "/posters/community-medicine.png"
  }
];
