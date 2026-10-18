const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl border-b border-border/50" />
      <div className="container relative flex items-center justify-between h-16 md:h-18">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            <img 
              src="https://r2.fivemanage.com/9PuRzEOMijfTY4k6VxC0r/imgi_1_CRIATIVOSIMAGEM(78).jpeg" 
              alt="Magnetize Logo" 
              className="relative h-9 w-auto rounded-lg"
            />
          </div>
        </div>
        

      </div>
    </header>
  );
};

export default Header;
