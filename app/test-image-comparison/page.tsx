import ImageComparisonSlider from "@/components/animations/image-comparison";

export default function TestImageComparisonPage() {
  // Sample images for testing (using placeholder images)
  const beforeImage = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
  const afterImage = "https://images.unsplash.com/photo-1514888286974-6d03bde4ba42?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 md:mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Image Comparison Slider Test
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Drag the slider handle to compare before and after images. This component supports
            mouse, touch, and keyboard navigation with smooth animations.
          </p>
        </header>

        <div className="space-y-12">
          {/* Basic Example */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Basic Image Comparison
            </h2>
            <ImageComparisonSlider
              beforeImage={beforeImage}
              afterImage={afterImage}
              beforeLabel="Before Grooming"
              afterLabel="After Grooming"
            />
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Usage:</h3>
              <pre className="text-sm bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto">
{`<ImageComparisonSlider
  beforeImage="${beforeImage}"
  afterImage="${afterImage}"
  beforeLabel="Before Grooming"
  afterLabel="After Grooming"
/>`}
              </pre>
            </div>
          </section>

          {/* With Reveal Animation */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              With Scroll Reveal Animation
            </h2>
            <p className="text-gray-600 mb-6">
              Scroll down to see the reveal animation in action.
            </p>
            <div className="h-96"></div> {/* Spacer to enable scrolling */}
            <ImageComparisonSlider
              beforeImage={beforeImage}
              afterImage={afterImage}
              beforeLabel="Unkempt"
              afterLabel="Groomed"
              revealOnScroll={true}
              className="mb-6"
            />
            <div className="h-96"></div> {/* More spacer */}
          </section>

          {/* Custom Position */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Custom Initial Position (75% After)
            </h2>
            <ImageComparisonSlider
              beforeImage={beforeImage}
              afterImage={afterImage}
              beforeLabel="Start"
              afterLabel="Finish"
              initialPosition={25} // Shows 75% of after image
            />
          </section>

          {/* Without Labels */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Minimal Version (No Labels)
            </h2>
            <ImageComparisonSlider
              beforeImage={beforeImage}
              afterImage={afterImage}
              showLabels={false}
              className="max-w-2xl"
            />
          </section>

          {/* Features Grid */}
          <section className="bg-white rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Component Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-xl">
                <h3 className="font-semibold text-blue-800 mb-2">🎯 Mouse & Touch Support</h3>
                <p className="text-blue-700">Drag the handle with mouse or touch gestures</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <h3 className="font-semibold text-green-800 mb-2">⌨️ Keyboard Accessible</h3>
                <p className="text-green-700">Use arrow keys for precise control</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <h3 className="font-semibold text-purple-800 mb-2">✨ Smooth Animations</h3>
                <p className="text-purple-700">Framer Motion powered transitions</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl">
                <h3 className="font-semibold text-yellow-800 mb-2">📱 Responsive Design</h3>
                <p className="text-yellow-700">Works perfectly on mobile devices</p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <h3 className="font-semibold text-red-800 mb-2">🎨 Customizable</h3>
                <p className="text-red-700">Labels, positions, animations, and more</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl">
                <h3 className="font-semibold text-indigo-800 mb-2">🔍 Scroll Reveal</h3>
                <p className="text-indigo-700">Optional animation when component enters view</p>
              </div>
            </div>
          </section>

          {/* Props Documentation */}
          <section className="bg-gray-900 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Props Documentation
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-gray-300">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-3 px-4 text-left font-medium">Prop</th>
                    <th className="py-3 px-4 text-left font-medium">Type</th>
                    <th className="py-3 px-4 text-left font-medium">Default</th>
                    <th className="py-3 px-4 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  <tr>
                    <td className="py-3 px-4 font-mono text-blue-300">beforeImage</td>
                    <td className="py-3 px-4">string</td>
                    <td className="py-3 px-4">-</td>
                    <td className="py-3 px-4">URL of the "before" image (required)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-blue-300">afterImage</td>
                    <td className="py-3 px-4">string</td>
                    <td className="py-3 px-4">-</td>
                    <td className="py-3 px-4">URL of the "after" image (required)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-blue-300">beforeLabel</td>
                    <td className="py-3 px-4">string</td>
                    <td className="py-3 px-4">"Prije"</td>
                    <td className="py-3 px-4">Label for the before image</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-blue-300">afterLabel</td>
                    <td className="py-3 px-4">string</td>
                    <td className="py-3 px-4">"Poslije"</td>
                    <td className="py-3 px-4">Label for the after image</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-blue-300">initialPosition</td>
                    <td className="py-3 px-4">number</td>
                    <td className="py-3 px-4">50</td>
                    <td className="py-3 px-4">Initial slider position (0-100)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-blue-300">revealOnScroll</td>
                    <td className="py-3 px-4">boolean</td>
                    <td className="py-3 px-4">false</td>
                    <td className="py-3 px-4">Animate in when component enters viewport</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-blue-300">showLabels</td>
                    <td className="py-3 px-4">boolean</td>
                    <td className="py-3 px-4">true</td>
                    <td className="py-3 px-4">Show/hide the before/after labels</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-blue-300">showHandle</td>
                    <td className="py-3 px-4">boolean</td>
                    <td className="py-3 px-4">true</td>
                    <td className="py-3 px-4">Show/hide the draggable handle</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-mono text-blue-300">className</td>
                    <td className="py-3 px-4">string</td>
                    <td className="py-3 px-4">-</td>
                    <td className="py-3 px-4">Additional CSS classes for styling</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500">
          <p>Image Comparison Slider Component • Built with React, TypeScript, Tailwind CSS & Framer Motion</p>
          <p className="mt-2 text-sm">Drag the slider to compare before and after pet grooming results</p>
        </footer>
      </div>
    </div>
  );
}