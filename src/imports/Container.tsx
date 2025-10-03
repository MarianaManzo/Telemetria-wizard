import svgPaths from "./svg-6tj16hghbf";

function Icon() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">
          <path d={svgPaths.p23d26800} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[24px] relative shrink-0 w-[129.969px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[129.969px]">
        <div className="absolute font-['Source_Sans_3:Medium',_sans-serif] font-medium leading-[0] left-0 text-[16px] text-neutral-950 text-nowrap top-0">
          <p className="leading-[24px] whitespace-pre">Mensaje del evento</p>
        </div>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex gap-[7px] h-[24px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon />
      <Heading3 />
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex h-[21px] items-start relative shrink-0 w-full" data-name="Text">
      <div className="basis-0 font-['Source_Sans_3:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">
        <p className="leading-[21px]">Mensaje del evento:</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[42px] relative shrink-0 w-full" data-name="Container">
      <div className="absolute font-['Source_Sans_3:Regular',_sans-serif] font-normal leading-[0] left-0 text-[14px] text-neutral-950 top-[-1px] w-[539px]">
        <p className="leading-[21px]">
          <span>{`La unidad `}</span>
          <span className="font-['Source_Sans_3:SemiBold',_sans-serif] font-semibold">Unidad ABC-123</span>
          <span>{` ha registrado una alerta en `}</span>
          <span className="font-['Source_Sans_3:SemiBold',_sans-serif] font-semibold text-[#1867ff]">Av. Corrientes 1234, Buenos Aires</span>
          <span>{` a las `}</span>
          <span className="font-['Source_Sans_3:SemiBold',_sans-serif] font-semibold">29/9/2025, 11:51:18.</span>
        </p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col gap-[10.5px] h-[73.5px] items-start relative shrink-0 w-full" data-name="Container">
      <Text />
      <Container1 />
    </div>
  );
}

function Container3() {
  return (
    <div className="bg-white h-[155.5px] relative rounded-[8.75px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8.75px]" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[14px] h-[155.5px] items-start pb-px pt-[22px] px-[22px] relative w-full">
          <Container />
          <Container2 />
        </div>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">
          <path d={svgPaths.p23d26800} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Heading4() {
  return (
    <div className="h-[24px] relative shrink-0 w-[156.984px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[156.984px]">
        <div className="absolute font-['Source_Sans_3:Medium',_sans-serif] font-medium leading-[0] left-0 text-[16px] text-neutral-950 text-nowrap top-0">
          <p className="leading-[24px] whitespace-pre">Canales de notificación</p>
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex gap-[7px] h-[24px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon1 />
      <Heading4 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">
          <path d={svgPaths.p23d26800} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Heading5() {
  return (
    <div className="h-[24px] relative shrink-0 w-[156.984px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[156.984px]">
        <div className="absolute font-['Source_Sans_3:Medium',_sans-serif] font-medium leading-[0] left-0 text-[16px] text-neutral-950 text-nowrap top-0">
          <p className="leading-[24px] whitespace-pre">Notificación Web</p>
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="basis-0 content-stretch flex gap-[7px] grow h-[24px] items-center min-h-px min-w-px relative shrink-0" data-name="Container">
      <Icon2 />
      <Heading5 />
    </div>
  );
}

function Handle() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Handle">
      <div className="[grid-area:1_/_1] bg-white ml-0 mt-0 rounded-[16px] shadow-[0px_2px_4px_0px_rgba(0,35,11,0.2)] size-[12px]" data-name="Handle BG" />
    </div>
  );
}

function Content() {
  return (
    <div className="box-border content-stretch flex gap-[2px] h-[16px] items-center justify-end overflow-clip p-[2px] relative shrink-0 w-[28px]" data-name="Content">
      <Handle />
    </div>
  );
}

function SwitchBasic() {
  return (
    <div className="bg-[#1867ff] h-[16px] min-w-[28px] opacity-[0.65] relative rounded-[16px] shrink-0" data-name="Switch / Basic">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[2px] h-[16px] items-start min-w-inherit relative">
        <Content />
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Text">
      <SwitchBasic />
    </div>
  );
}

function Container6() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[8.75px] shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8.75px]" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex gap-[14px] items-center px-[22px] py-[8px] relative w-full">
          <Container5 />
          <Text1 />
        </div>
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">
          <path d={svgPaths.p23d26800} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Heading6() {
  return (
    <div className="h-[24px] relative shrink-0 w-[156.984px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[156.984px]">
        <div className="absolute font-['Source_Sans_3:Medium',_sans-serif] font-medium leading-[0] left-0 text-[16px] text-neutral-950 text-nowrap top-0">
          <p className="leading-[24px] whitespace-pre">Notificación móvil</p>
        </div>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="basis-0 content-stretch flex gap-[7px] grow h-[24px] items-center min-h-px min-w-px relative shrink-0" data-name="Container">
      <Icon3 />
      <Heading6 />
    </div>
  );
}

function Handle1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Handle">
      <div className="[grid-area:1_/_1] bg-white ml-0 mt-0 rounded-[16px] shadow-[0px_2px_4px_0px_rgba(0,35,11,0.2)] size-[12px]" data-name="Handle BG" />
    </div>
  );
}

function Content1() {
  return (
    <div className="box-border content-stretch flex gap-[2px] h-[16px] items-center overflow-clip p-[2px] relative shrink-0 w-[28px]" data-name="Content">
      <Handle1 />
    </div>
  );
}

function SwitchBasic1() {
  return (
    <div className="bg-[rgba(0,0,0,0.25)] h-[16px] min-w-[28px] opacity-[0.65] relative rounded-[16px] shrink-0" data-name="Switch / Basic">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[2px] h-[16px] items-start min-w-inherit relative">
        <Content1 />
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-start relative">
        <SwitchBasic1 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex gap-[7px] h-[21px] items-center relative shrink-0" data-name="Container">
      <Text2 />
    </div>
  );
}

function Container9() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[8.75px] shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8.75px]" />
      <div className="flex flex-row items-center relative size-full">
        <div className="box-border content-stretch flex gap-[14px] items-center px-[22px] py-[8px] relative w-full">
          <Container7 />
          <Container8 />
        </div>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex gap-[14px] items-start relative shrink-0 w-full">
      <Container6 />
      <Container9 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">
          <path d={svgPaths.p23d26800} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Heading7() {
  return (
    <div className="h-[24px] relative shrink-0 w-[156.984px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[156.984px]">
        <div className="absolute font-['Source_Sans_3:Medium',_sans-serif] font-medium leading-[0] left-0 text-[16px] text-neutral-950 text-nowrap top-0">
          <p className="leading-[24px] whitespace-pre">Correo electrónico</p>
        </div>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="basis-0 content-stretch flex gap-[7px] grow h-[24px] items-center min-h-px min-w-px relative shrink-0" data-name="Container">
      <Icon4 />
      <Heading7 />
    </div>
  );
}

function Handle2() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Handle">
      <div className="[grid-area:1_/_1] bg-white ml-0 mt-0 rounded-[16px] shadow-[0px_2px_4px_0px_rgba(0,35,11,0.2)] size-[12px]" data-name="Handle BG" />
    </div>
  );
}

function Content2() {
  return (
    <div className="box-border content-stretch flex gap-[2px] h-[16px] items-center justify-end overflow-clip p-[2px] relative shrink-0 w-[28px]" data-name="Content">
      <Handle2 />
    </div>
  );
}

function SwitchBasic2() {
  return (
    <div className="bg-[#1867ff] h-[16px] min-w-[28px] relative rounded-[16px] shrink-0" data-name="Switch / Basic">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[2px] h-[16px] items-center justify-end min-w-inherit relative">
        <Content2 />
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-start relative">
        <SwitchBasic2 />
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex gap-[7px] h-[21px] items-center relative shrink-0" data-name="Container">
      <Text3 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex gap-[14px] items-center relative shrink-0 w-full">
      <Container10 />
      <Container11 />
    </div>
  );
}

function DividerHorizontal() {
  return (
    <div className="h-px relative shrink-0 w-full" data-name="Divider Horizontal">
      <div className="absolute h-0 left-0 right-0 top-1/2 translate-y-[-50%]" data-name="Line">
        <div className="absolute bottom-[-0.5px] left-0 right-0 top-[-0.5px]" style={{ "--stroke-0": "rgba(0, 0, 0, 1)" } as React.CSSProperties}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 533 2">
            <path d="M0 1H533" id="Line" stroke="var(--stroke-0, black)" strokeOpacity="0.06" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="absolute content-stretch flex h-[21px] items-start left-0 top-0 w-[278px]" data-name="Text">
      <div className="basis-0 font-['Source_Sans_3:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">
        <p className="leading-[21px]">Destinatario:</p>
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="absolute content-stretch flex h-[20px] items-start left-0 top-[24.5px] w-[122.984px]" data-name="Text">
      <div className="font-['Source_Sans_3:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[14px] text-neutral-950 text-nowrap">
        <p className="leading-[21px] whitespace-pre">usuarios@email.com</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="basis-0 grow h-[45.5px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <Text4 />
      <Text5 />
    </div>
  );
}

function Text6() {
  return (
    <div className="absolute content-stretch flex h-[21px] items-start left-0 top-0 w-[278px]" data-name="Text">
      <div className="basis-0 font-['Source_Sans_3:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">
        <p className="leading-[21px]">Asunto:</p>
      </div>
    </div>
  );
}

function Text7() {
  return (
    <div className="absolute h-[20px] left-0 top-[24.5px] w-[206.125px]" data-name="Text">
      <div className="absolute font-['Source_Sans_3:Regular',_sans-serif] font-normal leading-[0] left-0 text-[14px] text-neutral-950 top-[-1px] w-[207px]">
        <p className="leading-[21px]">{`[ALERTA] {unidad} - {regla_nombre}`}</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="basis-0 grow h-[45.5px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <Text6 />
      <Text7 />
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex gap-[7px] items-start relative shrink-0 w-full" data-name="Container">
      <Container12 />
      <Container13 />
    </div>
  );
}

function Container15() {
  return (
    <div className="bg-white relative rounded-[8.75px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8.75px]" />
      <div className="flex flex-col justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[14px] items-start justify-center px-[22px] py-[8px] relative w-full">
          <Frame3 />
          <DividerHorizontal />
          <Container14 />
        </div>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="bg-white relative rounded-[8.75px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8.75px]" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[14px] items-start px-[22px] py-[24px] relative w-full">
          <Container4 />
          <Frame4 />
          <Container15 />
        </div>
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="Icon">
          <path d={svgPaths.p55f200} id="Vector" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
          <path d={svgPaths.p4c1f200} id="Vector_2" stroke="var(--stroke-0, #717182)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
        </g>
      </svg>
    </div>
  );
}

function Heading8() {
  return (
    <div className="h-[24px] relative shrink-0 w-[64.063px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[64.063px]">
        <div className="absolute font-['Source_Sans_3:Medium',_sans-serif] font-medium leading-[0] left-0 text-[16px] text-neutral-950 text-nowrap top-0">
          <p className="leading-[24px] whitespace-pre">Webhook</p>
        </div>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex gap-[7px] h-[24px] items-center relative shrink-0 w-full" data-name="Container">
      <Icon5 />
      <Heading8 />
    </div>
  );
}

function Text8() {
  return (
    <div className="content-stretch flex h-[21px] items-start relative shrink-0 w-full" data-name="Text">
      <div className="basis-0 font-['Source_Sans_3:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">
        <p className="leading-[21px]">URL del webhook:</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex h-[21px] items-start relative shrink-0 w-full" data-name="Container">
      <div className="basis-0 font-['Source_Sans_3:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">
        <p className="leading-[21px]">https://api.miwebhook.com/alerta</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col gap-[10.5px] h-[52.5px] items-start relative shrink-0 w-full" data-name="Container">
      <Text8 />
      <Container18 />
    </div>
  );
}

function Container20() {
  return (
    <div className="bg-white h-[134.5px] relative rounded-[8.75px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8.75px]" />
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-[14px] h-[134.5px] items-start pb-px pt-[22px] px-[22px] relative w-full">
          <Container17 />
          <Container19 />
        </div>
      </div>
    </div>
  );
}

export default function Container21() {
  return (
    <div className="content-stretch flex flex-col gap-[21px] items-start relative size-full" data-name="Container">
      <Container3 />
      <Container16 />
      <Container20 />
    </div>
  );
}