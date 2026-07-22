"use client";

import { useState, type CSSProperties } from "react";
import { filters, portfolio } from "../siteData";

export default function CompaniesExperience() {
  const [filter, setFilter] = useState("all");

  return (
    <>
      <div className="company-filter reveal" role="group" aria-label="Filter all companies">
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
              <div className="directory-visual" aria-hidden="true">
                <span className="directory-grid" />
                <span className="directory-scan" />
                <strong>{company.name.slice(0, 1)}</strong>
                <small>QF / 0{index + 1}</small>
              </div>
              <div className="directory-copy">
                <div><span>{company.category}</span><span>FIRST PARTNERED / {company.year}</span></div>
                <h2>{company.name}</h2>
                <p>{company.line}</p>
              </div>
              <span className="directory-status"><i /> BUILDING</span>
            </article>
          );
        })}
      </div>
    </>
  );
}
