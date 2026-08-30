"""
05b_metar.py -- Surface observations (METAR/SPECI) for the fire period.

Uses the Iowa Environmental Mesonet ASOS/AWOS archive, network DZ__ASOS.
DAAV (Jijel / Taher, 36.795N 5.877E, 11 m) sits on the coastal plain inside
the fire complex and is the closest official observing site to the origins.

These are MEASURED values, unlike the gridded fields in 05_weather.py, and are
the only source here that can establish OBSERVED thunderstorm activity
(present-weather group containing 'TS') at a station.
"""
import csv, os, urllib.request, urllib.parse, datetime as dt

RAW, PRO = "data/raw", "data/processed"
ST = {
    "DAAV": ("Jijel / Taher", 36.795, 5.877, 11),
    "DABC": ("Constantine", 36.276, 6.620, 694),
    "DAAE": ("Bejaia / Soummam", 36.712, 5.070, 2),
    "DAAS": ("Setif / Ain Arnat", 36.183, 5.250, 1038),
    "DABB": ("Annaba", 36.822, 7.809, 4),
    "DABT": ("Batna", 35.752, 6.309, 1052),
}
PARAMS = [("network", "DZ__ASOS"), ("data", "all"),
          ("year1", 2026), ("month1", 8), ("day1", 20),
          ("year2", 2026), ("month2", 8), ("day2", 30),
          ("tz", "UTC"), ("format", "onlycomma"), ("latlon", "yes"),
          ("missing", "M"), ("trace", "T"), ("direct", "no"),
          ("report_type", "3"), ("report_type", "4")]

allrows = []
for sid, (nm, la, lo, el) in ST.items():
    url = "https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py?" + \
          urllib.parse.urlencode([("station", sid)] + PARAMS)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "wildfire-forensics/1.0"})
        with urllib.request.urlopen(req, timeout=180) as r:
            txt = r.read().decode("utf-8", errors="replace")
        open(os.path.join(RAW, "metar_%s.csv" % sid), "w", encoding="utf-8").write(txt)
        rows = list(csv.DictReader(txt.splitlines()))
    except Exception as e:
        print("  %-5s FAILED %s" % (sid, e))
        continue

    def f(v):
        try:
            return float(v)
        except (TypeError, ValueError):
            return None

    clean = []
    for r in rows:
        v = r.get("valid", "")
        if not v:
            continue
        utc = dt.datetime.strptime(v, "%Y-%m-%d %H:%M").replace(tzinfo=dt.timezone.utc)
        kt = f(r.get("sknt"))
        gkt = f(r.get("gust"))
        drct = f(r.get("drct"))
        # IEM data=all returns imperial columns: tmpf/dwpf (F), p01i (inch)
        tf, df_, pi = f(r.get("tmpf")), f(r.get("dwpf")), f(r.get("p01i"))
        tc = round((tf - 32) * 5 / 9, 1) if tf is not None else None
        dc = round((df_ - 32) * 5 / 9, 1) if df_ is not None else None
        clean.append({
            "station": sid, "name": nm, "lat": la, "lon": lo, "elev_m": el,
            "datetime_utc": utc.strftime("%Y-%m-%d %H:%M"),
            "datetime_local": (utc + dt.timedelta(hours=1)).strftime("%Y-%m-%d %H:%M"),
            "temp_c": tc, "dewpoint_c": dc,
            "rh_pct": f(r.get("relh")),
            "wind_from_deg": drct,
            "wind_to_deg": (drct + 180) % 360 if drct is not None else None,
            "wind_kmh": round(kt * 1.852, 1) if kt is not None else None,
            "gust_kmh": round(gkt * 1.852, 1) if gkt is not None else None,
            "precip_mm": round(pi * 25.4, 2) if pi is not None else None, "vis_mi": f(r.get("vsby")),
            "wxcodes": (r.get("wxcodes") or "").strip(),
            "metar": (r.get("metar") or "").strip(),
        })
    allrows.extend(clean)
    ts = [c for c in clean if "TS" in c["wxcodes"]]
    print("  %-5s %-20s rows=%4d   TS-coded obs=%d" % (sid, nm, len(clean), len(ts)))

allrows.sort(key=lambda r: (r["station"], r["datetime_utc"]))
with open(os.path.join(PRO, "metar_observations.csv"), "w", newline="", encoding="utf-8") as fh:
    w = csv.DictWriter(fh, fieldnames=list(allrows[0].keys()))
    w.writeheader()
    w.writerows(allrows)
print("\nwrote data/processed/metar_observations.csv rows=%d" % len(allrows))

print("\n" + "=" * 108)
print("ALL OBSERVATIONS WITH THUNDERSTORM ('TS') OR PRECIPITATION, 20-30 AUG 2026")
print("=" * 108)
hit = [r for r in allrows if "TS" in r["wxcodes"] or (r["precip_mm"] or 0) > 0]
if not hit:
    print("  none")
for r in hit:
    print("  %-5s %-16s local  wx=%-8s precip=%-5s  %s"
          % (r["station"], r["datetime_local"], r["wxcodes"] or "-",
             r["precip_mm"], r["metar"][:78]))

print("\n" + "=" * 108)
print("DAAV (JIJEL / TAHER) HOURLY CONDITIONS, 24-28 AUG 2026  -- local time (UTC+1)")
print("=" * 108)
print("%-16s %7s %7s %7s %10s %9s %9s %8s  %s"
      % ("local", "T(C)", "Td(C)", "RH%", "wind_from", "wind_kmh", "gust_kmh", "wind_to", "wx"))
print("-" * 108)
for r in allrows:
    if r["station"] != "DAAV":
        continue
    if not ("2026-08-24" <= r["datetime_local"][:10] <= "2026-08-28"):
        continue
    print("%-16s %7s %7s %7s %10s %9s %9s %8s  %s"
          % (r["datetime_local"], r["temp_c"], r["dewpoint_c"], r["rh_pct"],
             r["wind_from_deg"], r["wind_kmh"], r["gust_kmh"], r["wind_to_deg"], r["wxcodes"] or "-"))
