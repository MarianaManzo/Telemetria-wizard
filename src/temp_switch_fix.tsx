                             <DropdownMenuItem 
                               onClick={(e) => { 
                                 e.stopPropagation(); 
                                 handleToggleStatus(rule);
                               }}
                               className="flex items-center gap-2"
                             >
                               <div className="w-4 h-4 flex items-center justify-center">
                                 <Switch
                                   checked={rule.status === 'active'}
                                   onCheckedChange={() => {}} // Empty handler since we handle the click on the parent
                                   className="switch-blue scale-75 pointer-events-none"
                                 />
                               </div>
                               <span className="pt-[0px] pr-[0px] pb-[0px] pl-[8px]">{rule.status === 'active' ? 'Desactivar regla' : 'Activar regla'}</span>
                             </DropdownMenuItem>