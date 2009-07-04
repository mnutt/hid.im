ActionController::Routing::Routes.draw do |map|
  map.resources :hidims

  map.root :controller => 'hidims', :action => 'index'
end
