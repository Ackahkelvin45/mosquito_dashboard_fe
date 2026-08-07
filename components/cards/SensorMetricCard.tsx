import Image from "next/image";
function SensorMetricCard({
    title,
    icon: Icon,
    lines,
    iconBg,
  }: {
    title: string;
    icon: string;
    lines: { label: string; value: string }[];
    iconBg: string;
  }) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-raleway font-medium">
            {title}
          </span>

        
         
        </div>
        <div className="flex justify-center items-center my-4">
            <Image src={Icon} alt={title} width={100} height={100} className="h-auto object-contain" />
          </div>
        <div className="flex flex-col gap-1 text-center">
          {lines.map((line) => (
            <div
              key={line.label}
              className="text-sm font-mulish text-gray-800"
            >
              <span className="text-gray-500">{line.label} </span>
              <span className="font-semibold">{line.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  export default SensorMetricCard;