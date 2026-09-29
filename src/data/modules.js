export const modules = [
  {
    id:"fire",
    icon:"🔥",
    color:"#e8590c",
    title:{
      en:"Fire & Explosion Response",
      hi:"आग एवं विस्फोट प्रतिक्रिया",
      sat:"ᱥᱮᱸᱜᱮᱞ ᱟᱨ ᱵᱤᱥᱯᱷᱳᱨᱚᱱ"
    },
    description:{
      en:"Recognise fire hazards, select safe actions and follow evacuation procedures.",
      hi:"आग के खतरों की पहचान करें, सुरक्षित कार्रवाई चुनें और निकासी प्रक्रिया का पालन करें.",
      sat:"ᱥᱮᱸᱜᱮᱞ ᱦᱟᱡᱟᱨᱰ ᱵᱟᱰᱟᱭ ᱟᱨ ᱥᱩᱨᱚᱠᱪᱷᱟ ᱠᱟᱹᱢᱤ ᱥᱤᱠᱷᱟᱹ."
    },
    topics:[
      "Exit identification",
      "Extinguisher selection",
      "Evacuation sequence"
    ]
  },
  {
    id:"gas",
    icon:"☣️",
    color:"#7048e8",
    title:{
      en:"Gas Leak & Confined Space",
      hi:"गैस रिसाव एवं सीमित स्थान",
      sat:"ᱜᱮᱥ ᱞᱤᱠ ᱟᱨ ᱥᱤᱢᱤᱛ ᱴᱷᱟᱶ"
    },
    description:{
      en:"Recognise atmospheric hazards, PPE requirements and buddy procedures.",
      hi:"वायुमंडलीय खतरों, पीपीई और बडी सिस्टम प्रक्रियाओं को समझें.",
      sat:"ᱜᱮᱥ ᱦᱟᱡᱟᱨᱰ, PPE ᱟᱨ ᱵᱟᱰᱤ ᱥᱤᱥᱴᱚᱢ ᱵᱟᱰᱟᱭ."
    },
    topics:["Hazard zone","PPE selection","Buddy system"]
  },
  {
    id:"machine",
    icon:"⚙️",
    color:"#1971c2",
    title:{
      en:"Machinery Safety",
      hi:"मशीनरी सुरक्षा",
      sat:"ᱢᱮᱥᱤᱱ ᱥᱩᱨᱚᱠᱪᱷᱟ"
    },
    description:{
      en:"Understand moving hazards, machine guards, isolation and emergency stops.",
      hi:"चलते हिस्सों, मशीन गार्ड, आइसोलेशन और आपात स्टॉप को समझें.",
      sat:"ᱢᱮᱥᱤᱱ ᱦᱟᱡᱟᱨᱰ ᱟᱨ ᱤᱥᱚᱞᱮᱥᱚᱱ ᱵᱟᱰᱟᱭ."
    },
    topics:["Moving parts","Machine guards","Emergency stop","Energy isolation"]
  },
  {
    id:"electrical",
    icon:"⚡",
    color:"#f59f00",
    title:{
      en:"Electrical Safety",
      hi:"विद्युत सुरक्षा",
      sat:"ᱵᱤᱡᱽᱞᱤ ᱥᱩᱨᱚᱠᱪᱷᱟ"
    },
    description:{
      en:"Identify electrical hazards and learn isolation and safe-distance practices.",
      hi:"विद्युत खतरों की पहचान और सुरक्षित आइसोलेशन प्रक्रियाएं सीखें.",
      sat:"ᱵᱤᱡᱽᱞᱤ ᱦᱟᱡᱟᱨᱰ ᱟᱨ ᱥᱮᱯᱷ ᱰᱤᱥᱴᱟᱱᱥ ᱵᱟᱰᱟᱭ."
    },
    topics:["Electrical hazards","Isolation","Safe distance"]
  },
  {
    id:"ppe",
    icon:"⛑️",
    color:"#087f5b",
    title:{
      en:"PPE & Workplace Safety",
      hi:"पीपीई एवं कार्यस्थल सुरक्षा",
      sat:"PPE ᱟᱨ ᱠᱟᱹᱢᱤ ᱴᱷᱟᱶ ᱥᱩᱨᱚᱠᱪᱷᱟ"
    },
    description:{
      en:"Select appropriate personal protective equipment for common workplace hazards.",
      hi:"कार्यस्थल के खतरों के लिए उचित व्यक्तिगत सुरक्षा उपकरण चुनें.",
      sat:"ᱠᱟᱹᱢᱤ ᱴᱷᱟᱶ ᱦᱟᱡᱟᱨᱰ ᱞᱟᱹᱜᱤᱫ PPE ᱵᱟᱪᱷᱟᱣ."
    },
    topics:["Helmet","Eye protection","Respiratory protection","Hazard recognition"]
  }
];

export function getModule(id){
  return modules.find(x=>x.id===id);
}