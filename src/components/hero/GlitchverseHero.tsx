"use client";

import Image from "next/image";
import { Navbar } from "@/components/navbar/Navbar";
import { GlitchButton } from "@/components/ui/glitch-button";
import styles from "./GlitchverseHero.module.css";

const registrationUrl = "https://codeutsava-x.devfolio.co/overview";

export function GlitchverseHero() {
  return (
    <main className={styles.hero} id="top">
      <div className={styles.ambientLight} aria-hidden="true" />
      <div className={styles.noise} aria-hidden="true" />
      <Navbar />

      <section className={styles.heroStage} aria-labelledby="hero-title">
        <p className={styles.eyebrow}>WELCOME TO</p>

        <div className={styles.pagerShell}>
          <span className={styles.pagerTopRidge} aria-hidden="true"><i /><i /><i /></span>
          <span className={styles.pagerSpeaker} aria-hidden="true"><i /><i /><i /><i /><i /></span>
          <span className={styles.pagerControls} aria-hidden="true"><i /><i /></span>

          <div className={styles.pagerViewport}>
            <span className={styles.screenScanlines} aria-hidden="true" />
            <span className={`${styles.screenGlitchBand} ${styles.screenGlitchBandTop}`} aria-hidden="true" />
            <span className={`${styles.screenGlitchBand} ${styles.screenGlitchBandBottom}`} aria-hidden="true" />

            <h1 className={styles.identity} id="hero-title" aria-label="CodeUtsava X point zero, tenth edition">
              <span className={styles.wordmark} data-text="CODEUTSAVA">CODEUTSAVA</span>
              <span className={styles.editionCycle} aria-hidden="true">
                <span className={styles.editionX} data-text="X.0">X.0</span>
                <span className={styles.editionDas} data-text="दस" lang="hi">दस</span>
                <span className={styles.editionTen} data-text="10">10</span>
              </span>
            </h1>
          </div>
        </div>

        <p className={styles.tagline}>CODE. INNOVATE. CELEBRATE.</p>
        <p className={styles.eventLine}>NIT RAIPUR&apos;S FLAGSHIP TECH CELEBRATION&nbsp; // &nbsp;10TH EDITION</p>

        <div className={styles.heroActions} id="join">
          <GlitchButton
            label="REGISTER NOW"
            onClick={() => window.open(registrationUrl, "_blank", "noopener,noreferrer")}
          />
          <GlitchButton
            label="JOIN THE COMMUNITY"
            variant="secondary"
            icon={
              <Image
                src="/images/codeutsava/discord-symbol.svg"
                alt=""
                width={18}
                height={14}
              />
            }
            aria-label="Join the CodeUtsava community on Discord"
            onClick={() => window.open("https://discord.gg/Ek9gr2Xnqb", "_blank", "noopener,noreferrer")}
          />
        </div>
      </section>

      <div className={styles.bottomRail} aria-hidden="true">
        <span>CODEUTSAVA // X</span>
        <span>BUILD / BREAK / PERCEIVE / REIMAGINE</span>
        <span>BY TURING CLUB OF PROGRAMMERS</span>
      </div>
    </main>
  );
}
