import Image from "next/image";
import Link from "next/link";

import { requireUser } from "../../lib/auth";
import { getGachaGames } from "../../lib/content-data";

export default async function TrackerPage() {
  await requireUser("/tracker");
  const games = await getGachaGames();

  return (
    <>
      <div className="page-header">
        <p className="breadcrumb">{"// DIRECTORY: /home/igcomplex/tracker"}</p>
        <h1 className="headline">
          Pity<span className="accent-red">Tracker</span>
        </h1>
        <p className="text-secondary page-header__copy">Tracker data, current pity counts, and banner progress.</p>
        <div className="workspace-nav-links">
          <Link href="/workspace/tracker">Manage tracker entries</Link>
        </div>
      </div>

      <div className="grid grid-auto">
        {games.length > 0 ? (
          games.map((game) => (
            <article className="card tracker-card" key={game.id}>
              <div className="media-frame tracker-card__media">
                {game.bannerUrl ? (
                  <Image alt={game.title} fill sizes="(max-width: 768px) 100vw, 33vw" src={game.bannerUrl} />
                ) : (
                  <div className="tracker-card__placeholder">
                    <span className="mono label">[ NO_BANNER_DATA ]</span>
                  </div>
                )}
              </div>
              <h2 className="headline project-card__title">{game.title}</h2>
              <div className="card-divider meta-row">
                <span className="mono label">{game.year}</span>
              </div>
              <div className="tracker-card__stats">
                <p className="label">
                  Limited: {game.pityNumLim} / {game.pityMaxLim} {game.guaranteedLimited ? "[+]" : "[-]"}
                </p>
                <p className="label">
                  Weapon: {game.pityNumWep} / {game.pityMaxWep} {game.guaranteedWeapon ? "[+]" : "[-]"}
                </p>
                <p className="label">
                  Standard: {game.pityNumStd} / {game.pityMaxStd}
                </p>
              </div>
            </article>
          ))
        ) : (
          <section className="card card-stack">
            <p className="mono label">0 games found in the live data source.</p>
            <p className="text-secondary">Add tracker entries in the workspace when you are ready.</p>
          </section>
        )}
      </div>
    </>
  );
}