// https://github.com/lazd/iNoBounce/
window.bodyScrollLock = new (function() {
	const isiOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
	// Stores the Y position where the touch started
	let startY = 0;

	// Store enabled status
	let enabled = false;

	const handleTouchmove = function(evt) {
		// Get the element that was scrolled upon
		let el = evt.target;

		// Allow zooming
// 		const zoom = window.innerWidth / window.document.documentElement.clientWidth;
// 		if (evt.touches.length > 1 || zoom !== 1) {
// 			return;
// 		}

		// Check all parent elements for scrollability
		while (el !== document.body && el !== document) {
			// Get some style properties
			const style = window.getComputedStyle(el);

			if (!style) {
				// If we've encountered an element we can't compute the style for, get out
				break;
			}

			// Ignore range input element
			if (el.nodeName === 'INPUT' && el.getAttribute('type') === 'range') {
				return;
			}

			const scrolling = style.getPropertyValue('-webkit-overflow-scrolling');
			const overflowY = style.getPropertyValue('overflow-y');
			const height = parseInt(style.getPropertyValue('height'), 10);

			// Determine if the element should scroll
			const isScrollable = scrolling === 'touch' && (overflowY === 'auto' || overflowY === 'scroll');
			const canScroll = el.scrollHeight > el.offsetHeight;

			if (isScrollable && canScroll) {
				// Get the current Y position of the touch
				const curY = evt.touches ? evt.touches[0].screenY : evt.screenY;

				// Determine if the user is trying to scroll past the top or bottom
				// In this case, the window will bounce, so we have to prevent scrolling completely
				const isAtTop = (startY <= curY && el.scrollTop === 0);
				const isAtBottom = (startY >= curY && el.scrollHeight - el.scrollTop === height);

				// Stop a bounce bug when at the bottom or top of the scrollable element
				if (isAtTop || isAtBottom) {
					evt.preventDefault();
				}

				// No need to continue up the DOM, we've done our job
				return;
			}

			// Test the next parent
			el = el.parentNode;
		}

		// Stop the bouncing -- no parents are scrollable
		evt.preventDefault();
	};

	const handleTouchstart = function(evt) {
		// Store the first Y position of the touch
		startY = evt.touches ? evt.touches[0].screenY : evt.screenY;
	};

	this.enable = function() {
		if (enabled) { return; };
		if (isiOS) {
			// Listen to a couple key touch events
			window.addEventListener('touchstart', handleTouchstart, { passive : false });
			window.addEventListener('touchmove', handleTouchmove, { passive : false });
		} else {
			document.body.style.overflow = 'hidden';
		}

		enabled = true;
	};

	this.disable = function() {
		if (!enabled) { return; };
		if (isiOS) {
			// Stop listening
			window.removeEventListener('touchstart', handleTouchstart, false);
			window.removeEventListener('touchmove', handleTouchmove, false);
		} else {
			document.body.style.overflow = '';
		}
		
		enabled = false;
	};

	this.isEnabled = function() {
		return enabled;
	};
});
