import "./styles/Header.css";
import Menu from "./buttons/Menu";

function Header(){
    return (
        <>
            {/* Mobile Header - Horizontal */}
            <header className="header header-mobile">
                <Menu/>
                <div className="head-tag">
                    <span className="material-icons-outlined">auto_awesome</span>
                    <p>Cortex</p>
                </div>
                <button className="pen">
                    <i className="fa-solid fa-pen-to-square"></i>
                </button>
            </header>

            {/* Desktop Sidebar - Vertical */}
            <aside className="header header-desktop">
                {/* Primary Items */}
                <div className="sidebar-section">
                    <button className="sidebar-btn">
                        <span className="material-icons-outlined">auto_awesome</span>
                    </button>
                    <button className="sidebar-btn">
                        <span className="material-icons-outlined">dashboard</span>
                    </button>
                    <button className="sidebar-btn">
                        <span className="material-icons-outlined">credit_card</span>
                    </button>
                </div>

                {/* Secondary Items */}
                <div className="sidebar-section sidebar-secondary">
                    <button className="sidebar-btn">
                        <span className="material-icons-outlined">code</span>
                    </button>
                    <button className="sidebar-btn">
                        <span className="material-icons-outlined">refresh</span>
                    </button>
                    <button className="sidebar-btn">
                        <span className="material-icons-outlined">trending_up</span>
                    </button>
                    <button className="sidebar-btn">
                        <span className="material-icons-outlined">settings</span>
                    </button>
                </div>

                {/* Desktop Only Label */}
                <div className="desktop-label">
                    <p>Desktop only</p>
                </div>
            </aside>
        </>
    )
}

export default Header;