"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTelegramPlane } from "react-icons/fa";

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="bg-[#00272b] text-white">
			<div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
				<div className="flex flex-col md:flex-row md:justify-between gap-6">
					<div>
						<Link href="/" className="text-xl font-bold text-[#e0FF4F]">
							AutoLux.az
						</Link>
						<p className="text-sm text-gray-300 mt-2 max-w-md">
							Yerli avtomobil elanları platforması — sürətli, etibarlı və asan.
						</p>
					</div>

					<div className="flex gap-8">
						<div>
							<h4 className="font-semibold mb-2">Səhifələr</h4>
							<ul className="text-sm text-gray-300 space-y-1">
								<li>
									<Link href="/" className="hover:underline">
										Elanlar
									</Link>
								</li>
								<li>
									<Link href="/favorites" className="hover:underline">
										Favoritlər
									</Link>
								</li>
								<li>
									<Link href="/add" className="hover:underline">
										Elan yerləşdir
									</Link>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold mb-2">Haqqımızda</h4>
							<ul className="text-sm text-gray-300 space-y-1">
								<li>
									<Link href="/profile" className="hover:underline">
										Profil
									</Link>
								</li>
								<li>
									<Link href="/" className="hover:underline">
										Əlaqə
									</Link>
								</li>
								<li>
									<Link href="/" className="hover:underline">
										Şərtlər
									</Link>
								</li>
							</ul>
						</div>
					</div>

					<div className="flex flex-col items-start md:items-end gap-3">
						<div className="flex gap-3">
							<a
								href="#"
								aria-label="facebook"
								className="w-9 h-9 rounded-full bg-[#e0FF4F] text-black flex items-center justify-center hover:opacity-90"
							>
								<FaFacebookF />
							</a>

							<a
								href="#"
								aria-label="instagram"
								className="w-9 h-9 rounded-full bg-[#e0FF4F] text-black flex items-center justify-center hover:opacity-90"
							>
								<FaInstagram />
							</a>

							<a
								href="#"
								aria-label="telegram"
								className="w-9 h-9 rounded-full bg-[#e0FF4F] text-black flex items-center justify-center hover:opacity-90"
							>
								<FaTelegramPlane />
							</a>
						</div>

						<div className="text-sm text-gray-300">
							Support: 
							<a href="mailto:info@autolux.az" className="text-[#e0FF4F] hover:underline ml-1">
								info@autolux.az
							</a>
						</div>
					</div>
				</div>

				<div className="border-t border-gray-700 mt-6 pt-4 text-sm text-gray-400 flex flex-col md:flex-row md:justify-between gap-2">
					<div>© {year} AutoLux.az. Bütün hüquqlar qorunur.</div>
					<div>Design — AutoLux</div>
				</div>
			</div>
		</footer>
	);
}

