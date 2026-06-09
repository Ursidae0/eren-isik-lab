export function ForestBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="forest-backdrop pointer-events-none fixed inset-0 -z-30 overflow-hidden"
    >
      <div className="forest-sky absolute inset-0" />
      <div className="forest-light-shaft absolute inset-0" />

      <svg
        className="pine-ridge pine-ridge-back"
        viewBox="0 0 1600 560"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          d="M0 560V336L42 249L61 286L97 172L136 276L171 218L202 308L245 130L287 291L324 213L359 300L398 153L438 285L472 224L508 309L549 112L591 292L633 191L674 302L711 151L752 278L793 205L830 310L874 126L916 290L953 210L991 304L1030 167L1068 281L1108 218L1146 309L1191 118L1232 291L1270 194L1308 302L1346 151L1388 279L1428 214L1465 306L1510 135L1550 288L1600 212V560Z"
          fill="currentColor"
        />
      </svg>

      <svg
        className="pine-ridge pine-ridge-front"
        viewBox="0 0 1600 620"
        preserveAspectRatio="none"
        focusable="false"
      >
        <path
          d="M0 620V418L35 332L66 375L102 238L142 386L180 312L216 402L263 194L309 391L350 279L391 405L438 221L480 382L523 301L565 414L614 169L660 397L707 257L751 408L798 214L842 386L886 287L928 414L979 182L1025 395L1068 266L1112 405L1158 231L1204 389L1246 298L1289 412L1339 187L1384 394L1427 274L1471 408L1518 224L1560 383L1600 318V620Z"
          fill="currentColor"
        />
      </svg>

      <div className="forest-grid absolute inset-0" />
      <div className="fog-bank fog-bank-far absolute" />
      <div className="fog-bank fog-bank-near absolute" />
      <div className="forest-vignette absolute inset-0" />
    </div>
  );
}

