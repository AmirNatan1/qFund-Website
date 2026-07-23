"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { filters, portfolio } from "../siteData";

export default function CompaniesExperience() {
  const [filter, setFilter] = useState("all");

  return (
    <>
      <div className="company-filter reveal" role="group" aria-label="Filter portfolio companies">
        {filters.map(([value, label]) => (
          <button type="button" className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)} key={value}>
            <span>{label}</span><i>{portfolio.filter((company) => value === "all" || company.group === value).length}</i>
          </button>
        ))}
      </div>

      <div className="company-directory" aria-live="polite">
        {portfolio.map((company, index) => {
          const visible = filter === "all" || filter === company.group;
          return (
            <article
              className={visible ? "directory-card reveal is-filtered-in" : "directory-card reveal is-filtered-out"}
              style={{ "--company-index": index } as CSSProperties}
              aria-hidden={!visible}
              key={company.name}
            >
              <a
                className="directory-visual directory-logo-link"
                href={company.website}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit ${company.name}`}
              >
                <span className="directory-grid" aria-hidden="true" />
                <span className="directory-scan" aria-hidden="true" />
                <Image src={company.logo} alt={`${company.name} logo`} width={600} height={240} />
                <small>QF / {String(index + 1).padStart(2, "0")} · WEBSITE ↗</small>
              </a>
              <div className="directory-copy">
                <div><span>{company.category}</span><span>FOUNDED / {company.founded} · {company.stage}</span></div>
                <h2>{company.name}</h2>
                <p>{company.description}</p>
              </div>
              <a className="directory-status" href={company.website} target="_blank" rel="noreferrer">
                <i /> COMPANY WEBSITE ↗
              </a>
            </article>
          );
        })}
      </div>
    </>
  );
}
