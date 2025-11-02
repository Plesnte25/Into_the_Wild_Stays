const BookingPolicies = () => {
    return (
      <div className="container w-full min-h-[100vh] px-4 py-16 text-center">
        {/* Booking Policies Section */}
        <h2 className="text-2xl font-semibold text-[#3C8D99] mb-6 mt-10">
          Booking Policies & Privacy Policy
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="p-6 border rounded-lg shadow-lg">
            <h3 className="lg:text-xl text-xl font-semibold text-[#091F3C] mb-4 ">Property Rules</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>100% Power backup.</li>
              <li>Please Be mindful and keep the noise to the minimum after 10 pm.</li>
              <li>Check-in: 2 PM, Check-out: 11 AM.</li>
              <li>Guests below 18 years of age are allowed.</li>
              <li>Unmarried couples allowed.</li>
            </ul>
          </div>
  
          <div className="p-6 border rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-[#091F3C] mb-4">Refund & Rescheduling Policy</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Refund would be processed in 14 working days.</li>
              <li>Booking can be rescheduled till 15 days prior to arrival date.</li>
              <li>Rs 1000 plus applicable taxes will be charged for rescheduling.</li>
              <li>Rescheduling can be done only for the same property.</li>
              <li>If the tariff on the rescheduled date is higher than the initial booking date then difference is payable.</li>
            </ul>
          </div>
  
          <div className="p-6 border rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-[#091F3C] mb-4">Things you need to know</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>The full payment must be made for your booking to be confirmed.</li>
              <li>Only the guest who have been accounted for are allowed at the villa.</li>
              <li>Any damage to the property caused by the guest will be charged as per the actual cost of repair or replacement.</li>
              <li>Any commercial activity is strictly not permitted.</li>
              <li>Guests are earnestly requested to treat the home with care.</li>
              <li>Smoking is allowed in the exterior areas of villa only.</li>
            </ul>
          </div>
  
          <div className="p-6 border rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-[#091F3C] mb-4">Cancellation and Refund Policy</h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Cancellation 12 days prior to arrival date 15% will be charged.</li>
              <li>Cancellation 07 days prior to arrival date 50% will be charged.</li>
              <li>Cancellation less than a week full retention would be applicable.</li>
              <li>Credit/Debit card cancellation will be charged 5% extra.</li>
              <li>Cancellation policy for long weekends and special days: Cancellation 07 days prior to arrival date 50% will be charged.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  export default BookingPolicies;
  
