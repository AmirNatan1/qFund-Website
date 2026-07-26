export type PortfolioFounder = {
  name: string;
  role: string;
  company: string;
  bio: string | null;
  linkedin: string | null;
  headshot: string | null;
};

export const portfolioFounders: readonly PortfolioFounder[] = [
  { name: "Itzik Daniel Michaeli", role: "Co-Founder & CEO", company: "Commcrete", bio: "Satellite communications for special operations; alumnus of Unit 81.", linkedin: null, headshot: null },
  { name: "Joshua Yedidya", role: "Co-Founder & CTO", company: "Commcrete", bio: "Unit 81 alumnus; builds compact, high-performance RF transceivers.", linkedin: null, headshot: null },
  { name: "Michael Mor", role: "Co-Founder & COO", company: "Commcrete", bio: "Unit 81 alumnus, tactical satellite communications.", linkedin: null, headshot: null },
  { name: "Daniel Lublin", role: "Co-Founder & CEO", company: "Element Security", bio: "Previously at Check Point.", linkedin: null, headshot: null },
  { name: "Ido Bar-On", role: "Co-Founder & CEO", company: "Skapion", bio: "Previously at Intel.", linkedin: null, headshot: null },
  { name: "Gal Goren", role: "Co-Founder & CTO", company: "Skapion", bio: "Previously at Intel.", linkedin: null, headshot: null },
  { name: "Pini Yungman", role: "President", company: "Skapion", bio: "Previously at Rafael.", linkedin: null, headshot: null },
  { name: "Liav Georgy", role: "Co-Founder & CEO", company: "Oraqon", bio: "Elite defense command background; took a laser-detection product to AUSA within five months of founding the company.", linkedin: null, headshot: null },
  { name: "Avihood Ben Ari", role: "Co-Founder & President", company: "Oraqon", bio: "Elite defense commander.", linkedin: null, headshot: null },
  { name: "Prof. Hagai Eisenberg", role: "Co-Founder & CSO", company: "Oraqon", bio: "Quantum optics researcher working on single-photon detection.", linkedin: null, headshot: null },
  { name: "Asif Sinay, PhD", role: "Co-Founder & CEO", company: "Qedma", bio: null, linkedin: null, headshot: null },
  { name: "Prof. Netanel Lindner", role: "Co-Founder & CTO", company: "Qedma", bio: "Theoretical physicist working on quantum error suppression.", linkedin: null, headshot: null },
  { name: "Prof. Dorit Aharonov", role: "Co-Founder & CSO", company: "Qedma", bio: "A foundational figure in the theory of quantum computation.", linkedin: null, headshot: null },
  { name: "David Menicovich, PhD", role: "Co-Founder & CEO", company: "Actasys", bio: null, linkedin: null, headshot: null },
  { name: "Omri Cherni", role: "Co-Founder & CEO", company: "Particle", bio: "Previously at Atlas.", linkedin: null, headshot: null },
  { name: "Prof. Aharon Friedman", role: "Co-Founder & CSO", company: "Particle", bio: "Particle accelerator physicist.", linkedin: null, headshot: null },
  { name: "Udi Raviv", role: "Co-Founder & CEO", company: "Signal Edge", bio: "Unit 8200 alumnus with a background in electromagnetic technology.", linkedin: null, headshot: null },
  { name: "Tamar Harary", role: "Co-Founder & CEO", company: "LiteVision", bio: "Previously at Elbit and Rafael.", linkedin: null, headshot: null },
  { name: "Guy Moshel, PhD", role: "Co-Founder & CTO", company: "LiteVision", bio: "Physicist, previously at Rafael.", linkedin: null, headshot: null },
  { name: "Uriya Harary", role: "Co-Founder & COO", company: "LiteVision", bio: null, linkedin: null, headshot: null },
  { name: "Alon Cohen", role: "Co-Founder & CEO", company: "QuamCore", bio: "Previously at Mobileye.", linkedin: null, headshot: null },
  { name: "Prof. Shay Hacohen-Gourgy", role: "Co-Founder & CTO", company: "QuamCore", bio: "Researcher in superconducting qubits.", linkedin: null, headshot: null },
  { name: "Serge Rosenblum, PhD", role: "Chief Scientist", company: "QuamCore", bio: null, linkedin: null, headshot: null },
];
