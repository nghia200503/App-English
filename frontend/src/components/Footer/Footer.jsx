import "./Footer.css";

function Footer() {
  return (
    <footer>
        <div className="footer-content">
            <div className="footer-links">
                <a href="#about">Về chúng tôi</a>
                <a href="#contact">Liên hệ</a>
                <a href="#privacy">Chính sách bảo mật</a>
                <a href="#terms">Điều khoản sử dụng</a>
            </div>
            <p>&copy; 2025 LearnX. All rights reserved. Made with ❤️ for language learners.</p>
        </div>
    </footer>
  );
};

export default Footer
