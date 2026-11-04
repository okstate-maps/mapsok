import '../src/index.css';
import '../src/App.css';
import '../src/Sidebar.css';
import '../src/MapView.css';
import '../src/Item.css';
import '../src/Modal.css';
import '../src/leaflet.css';
import '../src/leaflet.draw.css';

export const metadata = {
  title: 'mapsOK',
  description: 'Search Oklahoma historical maps',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body id="root">{children}</body>
    </html>
  );
}
