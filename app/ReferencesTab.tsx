import { papers, paperCategories, paperSectionTitles } from "@/lib/papers";

export default function ReferencesTab() {
  return (
    <section className="panel references-tab">
      <h2>Reference Papers</h2>
      <p className="references-intro">
        This simulation is based on evidence from the following peer-reviewed papers and systematic reviews.
      </p>

      <div className="references-grid">
        {paperCategories.map((category) => (
          <div key={category}>
            <h3 className="references-section-title">{paperSectionTitles[category]}</h3>
            <ul className="references-list">
              {papers[category].map((paper) => (
                <li key={paper.url} className="references-item">
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="references-link"
                  >
                    {paper.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
