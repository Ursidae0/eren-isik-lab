export function ForestBackdrop() {
  return (
    <>
      <div aria-hidden="true" className="forest-backdrop">
        <div className="forest-season forest-season-spring" />
        <div className="forest-season forest-season-summer" />
        <div className="forest-season forest-season-autumn" />
        <div className="forest-season forest-season-winter" />
        <div className="forest-weather" />
        <div className="forest-grain" />
      </div>
      <div aria-hidden="true" className="page-weather">
        <span />
        <span />
      </div>
    </>
  );
}
