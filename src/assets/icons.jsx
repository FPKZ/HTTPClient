

const icons = () => {

    const fullLogo = () => {
        return (
            <svg width="240" height="80" viewBox="0 0 240 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 10L15 45H35L25 70L55 30H35L40 10Z" fill="#FFC107"/>
                <text x="70" y="52" fill="white" font-family="Inter" font-weight="800" font-style="italic" font-size="42">VOLT</text>
            </svg>
        )
    }

    const squereIcon = () => {
        return (
            <div class="w-24 h-24 bg-[#1E1E1E] rounded-2xl flex items-center justify-center shadow-lg border border-gray-700">
                <svg width="48" height="48" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 10L15 45H35L25 70L55 30H35L40 10Z" fill="#FFC107"/>
                </svg>
            </div>
        )
    }

    const roundIcon = () => {
        return (
            <div class="w-24 h-24 bg-[#FFC107] rounded-full flex items-center justify-center shadow-lg">
                <svg width="40" height="40" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 10L15 45H35L25 70L55 30H35L40 10Z" fill="#121212"/>
                </svg>
            </div>
        )
    }
    
    const todosIcons = () => {
        return (
            <section class="max-w-6xl mx-auto mb-20">
                <div class="flex items-center gap-4 mb-6">
                    <h2 class="text-2xl font-bold text-[#FFC107]">Opção A: VOLT</h2>
                    <span class="px-3 py-1 text-xs bg-[#FFC107] text-black font-bold rounded-full">ENERGIA & VELOCIDADE</span>
                </div>
                <p class="mb-8 text-gray-400 max-w-2xl">Um visual agressivo e minimalista. O raio simboliza a velocidade da requisição. A tipografia é itálica para dar sensação de movimento.</p>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* <!-- Full Logo --> */}
                    <div class="col-span-1 md:col-span-2 bg-[#1E1E1E] p-8 rounded-xl border border-gray-800 flex flex-col items-center justify-center">
                        <span class="text-xs text-gray-500 mb-4 uppercase tracking-widest">Logo Principal</span>
                        <svg width="240" height="80" viewBox="0 0 240 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M40 10L15 45H35L25 70L55 30H35L40 10Z" fill="#FFC107"/>
                            <text x="70" y="52" fill="white" font-family="Inter" font-weight="800" font-style="italic" font-size="42">VOLT</text>
                        </svg>
                    </div>

                    {/* <!-- Square Icon --> */}
                    <div class="bg-black p-8 rounded-xl border border-gray-800 flex flex-col items-center justify-center">
                        <span class="text-xs text-gray-500 mb-4 uppercase tracking-widest">App Icon (Quadrado)</span>
                        <div class="w-24 h-24 bg-[#1E1E1E] rounded-2xl flex items-center justify-center shadow-lg border border-gray-700">
                            <svg width="48" height="48" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M40 10L15 45H35L25 70L55 30H35L40 10Z" fill="#FFC107"/>
                            </svg>
                        </div>
                    </div>

                        {/* <!-- Round Icon --> */}
                        <div class="bg-black p-8 rounded-xl border border-gray-800 flex flex-col items-center justify-center">
                        <span class="text-xs text-gray-500 mb-4 uppercase tracking-widest">App Icon (Redondo)</span>
                        <div class="w-24 h-24 bg-[#FFC107] rounded-full flex items-center justify-center shadow-lg">
                            <svg width="40" height="40" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M40 10L15 45H35L25 70L55 30H35L40 10Z" fill="#121212"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return {
        todosIcons,
        roundIcon,
        squereIcon,
        fullLogo
    }
}

export default icons
