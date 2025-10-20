import PixelBlast from "./PixelBlast"

export const WithBackground = ({ children }: { children: React.ReactNode }) => {
    return (
        <div style={{ width: '100%', minHeight: '100vh', position: 'relative'}}>
            <PixelBlast
                variant="square"
                pixelSize={4}
                color="rgba(177,158,239)"
                patternScale={2}
                patternDensity={1}
                pixelSizeJitter={0}
                enableRipples
                rippleSpeed={0.4}
                rippleThickness={0.12}
                rippleIntensityScale={1.5}
                speed={0.5}
                edgeFade={0.25}
                transparent
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    pointerEvents: 'auto'
                }}
            />

            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1, pointerEvents: 'none' }}>
                {children}
            </div>
        </div>
    )
}