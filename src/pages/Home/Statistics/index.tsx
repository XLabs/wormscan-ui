import "./styles.scss";

const Statistics = () => {
  return (
    <section className="home-statistics">
      <div className="home-statistics-graph">Graph</div>
      <div className="home-statistics-data">
        <div className="home-statistics-data-row">
          <div className="home-statistics-data-row-item">
            <div className="home-statistics-data-row-item-title">Connected chains</div>
            <div className="home-statistics-data-row-item-value">16</div>
          </div>
          <div className="home-statistics-data-row-item">
            <div className="home-statistics-data-row-item-title">All time volume</div>
            <div className="home-statistics-data-row-item-value">$6,400,000</div>
          </div>
          <div className="home-statistics-data-row-item">
            <div className="home-statistics-data-row-item-title">Total TVL</div>
            <div className="home-statistics-data-row-item-value">$19,400,321</div>
          </div>
        </div>
        <hr />
        <div className="home-statistics-data-row">
          <div className="home-statistics-data-row-item">
            <div className="home-statistics-data-row-item-title">Message volume</div>
            <div className="home-statistics-data-row-item-value">1,000,234</div>
          </div>
          <div className="home-statistics-data-row-item">
            <div className="home-statistics-data-row-item-title">Assets transfer</div>
            <div className="home-statistics-data-row-item-value">$6,400,000</div>
          </div>
          <div className="home-statistics-data-row-item">
            <div className="home-statistics-data-row-item-title">Validators</div>
            <div className="home-statistics-data-row-item-value">19</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Statistics };
