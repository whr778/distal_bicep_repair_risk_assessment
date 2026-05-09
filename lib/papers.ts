export type PaperCategory = "complications" | "healing" | "reinjury";

export interface Paper {
  title: string;
  url: string;
}

export const paperSectionTitles: Record<PaperCategory, string> = {
  complications: "Complications",
  healing: "Tendon Healing",
  reinjury: "Post-Surgical Re-injury",
};

export const papers: Record<PaperCategory, Paper[]> = {
  complications: [
    { title: "Complications After Distal Biceps Tendon Repair: A Systematic Review", url: "https://pubmed.ncbi.nlm.nih.gov/32091914/" },
    { title: "Distal biceps tendon repair: outcome and complications with single incision anchor fixation", url: "https://pubmed.ncbi.nlm.nih.gov/39177818/" },
    { title: "Ultrasonography of Complications in Surgical Repair of the Distal Biceps Brachii Tendon", url: "https://pubmed.ncbi.nlm.nih.gov/30027585/" },
    { title: "Primary Repair of Chronic Distal Biceps Tendon Tears", url: "https://pubmed.ncbi.nlm.nih.gov/35815641/" },
    { title: "Intramedullary, unicortical repair of distal biceps tendon rupture", url: "https://pubmed.ncbi.nlm.nih.gov/37587954/" },
    { title: "Power-Optimizing Repair for Distal Biceps Tendon Rupture: Stronger and Safer", url: "https://pubmed.ncbi.nlm.nih.gov/35415576/" },
    { title: "All-suture anchors for distal biceps tendon repair: a preliminary outcome study", url: "https://pubmed.ncbi.nlm.nih.gov/36416943/" },
    { title: "Distal biceps tendon repair using a double intracortical button anatomic footprint repair technique", url: "https://pubmed.ncbi.nlm.nih.gov/38688419/" },
    { title: "Endoscopic Repair of the Distal Biceps Tendon", url: "https://pubmed.ncbi.nlm.nih.gov/39989675/" },
  ],
  healing: [
    { title: "Tendon and Ligament Healing and Current Approaches to Tendon and Ligament Regeneration", url: "https://pubmed.ncbi.nlm.nih.gov/31529731/" },
    { title: "Biology of tendon injury: healing, modeling and remodeling", url: "https://pubmed.ncbi.nlm.nih.gov/16849830/" },
    { title: "Tendon healing", url: "https://pubmed.ncbi.nlm.nih.gov/17996614/" },
    { title: "Different gene response to mechanical loading during early and late phases of rat Achilles tendon healing", url: "https://pubmed.ncbi.nlm.nih.gov/28705996/" },
  ],
  reinjury: [
    { title: "Re-rupture rate of primarily repaired distal biceps tendon injuries", url: "https://pubmed.ncbi.nlm.nih.gov/24774620/" },
    { title: "Trends and complications of distal biceps tendon repair among American Board of Orthopaedic Surgery part II oral examination candidates", url: "https://pubmed.ncbi.nlm.nih.gov/36273792/" },
    { title: "Determining the incidence and risk factors for short-term complications following distal biceps tendon repair", url: "https://pubmed.ncbi.nlm.nih.gov/35045595/" },
    { title: "Distal biceps reconstruction 13 years post-injury", url: "https://pubmed.ncbi.nlm.nih.gov/25829956/" },
    { title: "Distal Biceps Tendon Repair in Competitive Strength Athletes: A Retrospective Series of 183 Athletes", url: "https://pubmed.ncbi.nlm.nih.gov/40182566/" },
    { title: "Return to Sport After Distal Biceps Tendon Repair: A Systematic Review", url: "https://pubmed.ncbi.nlm.nih.gov/39836380/" },
    { title: "Return to Play After Distal Biceps Tendon Repair", url: "https://pubmed.ncbi.nlm.nih.gov/35195840/" },
    { title: "Treatment Delay and Type of Retraction Affect the Surgical Treatment of Distal Biceps Tendon Ruptures: A Quantitative Analysis of 123 Patients", url: "https://pubmed.ncbi.nlm.nih.gov/40868593/" },
  ],
};

export const paperCategories: PaperCategory[] = ["complications", "healing", "reinjury"];
