import React from 'react'

const Footer = () => {
    return (
        <div >
            <footer className="border-t py-4 text-center text-sm text-muted-foreground">
                Coupon Distribution System © {new Date().getFullYear()}
            </footer>
        </div>
    )
}

export default Footer
