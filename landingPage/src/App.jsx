import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Screenshots from "./components/Screenshots";
import Donation from "./components/Donation";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <Screenshots />
        <Donation />
      </main>
      <Footer />
    </div>
  );
}

export default App;
