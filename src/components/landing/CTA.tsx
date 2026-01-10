


const CTA = () => {
  return (
    <section className="py-20 md:py-32 bg-consensus-blue relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-consensus-blue opacity-90"></div>
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-white/10 rounded-full"></div>
        <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-1/3 right-1/3 w-32 h-32 bg-white/10 rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-sf text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Ready to Transform Your Decision-Making?
          </h2>

          <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-3xl mx-auto">
            Join innovative teams already using ConsensusAI to make smarter, faster, and more inclusive decisions.
          </p>




        </div>
      </div>
    </section>
  );
};

export default CTA;
